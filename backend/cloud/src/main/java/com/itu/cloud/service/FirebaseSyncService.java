package com.itu.cloud.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.itu.cloud.config.FirebaseConfig;
import com.itu.cloud.entity.Report;
import com.itu.cloud.entity.User;
import com.itu.cloud.entity.SyncLog;
import com.itu.cloud.repository.ReportRepository;
import com.itu.cloud.repository.UserRepository;
import com.itu.cloud.repository.SyncLogRepository;
import com.itu.cloud.entity.PhotoReport;
import com.itu.cloud.repository.PhotoReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseSyncService {

    private final FirebaseConfig firebaseConfig;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final SyncLogRepository syncLogRepository;
    private final PhotoReportRepository photoReportRepository;

    public FirebaseSyncService(FirebaseConfig firebaseConfig, 
                               UserRepository userRepository,
                               ReportRepository reportRepository,
                               SyncLogRepository syncLogRepository,
                               PhotoReportRepository photoReportRepository) {
        this.firebaseConfig = firebaseConfig;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.syncLogRepository = syncLogRepository;
        this.photoReportRepository = photoReportRepository;
    }

    /**
     * Obtient une instance Firestore valide.
     * Si le client a été fermé, réinitialise Firebase et retourne une nouvelle instance.
     */
    private Firestore getFirestore() {
        try {
            Firestore fs = firebaseConfig.getFirestore();
            if (fs == null) {
                throw new IllegalStateException("Firestore non disponible. Vérifiez la configuration Firebase.");
            }
            return fs;
        } catch (Exception e) {
            System.out.println("⚠️ Firestore indisponible, tentative de réinitialisation...");
            firebaseConfig.reinitialize();
            Firestore fs = firebaseConfig.getFirestore();
            if (fs == null) {
                throw new IllegalStateException("Firestore non disponible après réinitialisation. Vérifiez firebase-service-account.json.");
            }
            return fs;
        }
    }

    // ==========================================
    // SYNCHRONISATION BIDIRECTIONNELLE COMPLÈTE
    // ==========================================

    @Transactional
    public SyncLog syncAll(User syncedBy) {
        SyncLog log = new SyncLog();
        log.setSyncType("full");
        log.setSyncedBy(syncedBy);
        log.setSyncedAt(LocalDateTime.now());
        
        int pulled = 0;
        int pushed = 0;
        int conflicts = 0;

        try {
            // 1. Sync Users: Firebase -> PostgreSQL
            pulled += pullUsersFromFirebase();
            
            // 2. Sync Users: PostgreSQL -> Firebase
            pushed += pushUsersToFirebase();
            
            // 3. Sync Reports: Firebase -> PostgreSQL
            pulled += pullReportsFromFirebase();
            
            // 4. Sync Reports: PostgreSQL -> Firebase
            pushed += pushReportsToFirebase();

            log.setRecordsPulled(pulled);
            log.setRecordsPushed(pushed);
            log.setConflicts(conflicts);
            log.setStatus("success");
            
        } catch (Exception e) {
            // Si le client Firestore a été fermé, tenter une réinitialisation et réessayer
            if (e.getMessage() != null && e.getMessage().contains("already been closed")) {
                System.out.println("🔄 Client Firestore fermé détecté, réinitialisation en cours...");
                firebaseConfig.reinitialize();
                try {
                    pulled += pullUsersFromFirebase();
                    pushed += pushUsersToFirebase();
                    pulled += pullReportsFromFirebase();
                    pushed += pushReportsToFirebase();
                    log.setRecordsPulled(pulled);
                    log.setRecordsPushed(pushed);
                    log.setConflicts(conflicts);
                    log.setStatus("success");
                } catch (Exception retryEx) {
                    log.setStatus("failed");
                    log.setErrorMessage("Échec après réinitialisation: " + retryEx.getMessage());
                }
            } else {
                log.setStatus("failed");
                log.setErrorMessage(e.getMessage());
            }
        }

        return syncLogRepository.save(log);
    }

    // ==========================================
    // PULL: Firebase → PostgreSQL
    // ==========================================

    public int pullUsersFromFirebase() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = getFirestore().collection("users").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        int count = 0;

        for (QueryDocumentSnapshot doc : documents) {
            String firebaseUid = doc.getId();
            String email = doc.getString("email");
            
            // 1. Vérifier par firebaseUid
            if (firebaseUid == null || firebaseUid.isEmpty()) continue;
            Optional<User> existingByUid = userRepository.findByFirebaseUid(firebaseUid);
            
            // 2. Vérifier aussi par email pour éviter les doublons
            Optional<User> existingByEmail = (email != null) ? userRepository.findByEmail(email) : Optional.empty();
            
            if (existingByUid.isPresent()) {
                // L'utilisateur existe déjà avec ce firebaseUid - mettre à jour
                User user = existingByUid.get();
                updateUserFromFirebase(user, doc);
                userRepository.save(user);
            } else if (existingByEmail.isPresent()) {
                // L'utilisateur existe avec cet email mais sans firebaseUid - lier et mettre à jour
                User user = existingByEmail.get();
                user.setFirebaseUid(firebaseUid);
                updateUserFromFirebase(user, doc);
                userRepository.save(user);
                count++; // Compté comme sync car on a lié les comptes
            } else {
                // Nouvel utilisateur - créer
                User user = new User();
                user.setFirebaseUid(firebaseUid);
                user.setEmail(email);
                user.setFirstName(doc.getString("firstName"));
                user.setLastName(doc.getString("lastName"));
                user.setRole(doc.getString("role") != null ? doc.getString("role") : "utilisateur");
                user.setPasswordHash("firebase_auth");
                user.setVerified(true);
                
                userRepository.save(user);
                count++;
            }
        }
        
        return count;
    }

    public int pullReportsFromFirebase() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = getFirestore().collection("reports").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        int count = 0;

        for (QueryDocumentSnapshot doc : documents) {
            String firebaseId = doc.getId();
            
            // 1. Vérifier si le report existe déjà par firebaseId
            Optional<Report> existingReport = reportRepository.findByFirebaseId(firebaseId);
            
            if (existingReport.isPresent()) {
                // Mettre à jour le report existant
                Report report = existingReport.get();
                updateReportFromFirebase(report, doc);
                reportRepository.save(report);
                // Synchroniser les photos si présentes
                try {
                    syncPhotosFromFirebase(report, doc);
                } catch (Exception e) {
                    System.err.println("[PhotoSync] Erreur lors de la synchronisation des photos pour report id=" + report.getId() + ": " + e.getMessage());
                }
            } else {
                // 2. Vérifier si un report similaire existe (même user, même position, même description)
                String userFirebaseUid = doc.getString("userId");
                Optional<User> user = (userFirebaseUid != null) 
                        ? userRepository.findByFirebaseUid(userFirebaseUid) 
                        : Optional.empty();
                
                // Si l'utilisateur n'est pas trouvé par firebaseUid, chercher par email
                if (user.isEmpty()) {
                    String userEmail = doc.getString("userEmail");
                    if (userEmail != null) {
                        user = userRepository.findByEmail(userEmail);
                    }
                }
                
                if (user.isPresent()) {
                    BigDecimal lat = getBigDecimal(doc, "latitude");
                    BigDecimal lng = getBigDecimal(doc, "longitude");
                    String description = doc.getString("description");
                    
                    // Chercher un report existant avec les mêmes coordonnées et description
                    Optional<Report> similar = reportRepository.findByUserAndLatitudeAndLongitudeAndDescription(
                            user.get(), lat, lng, description);
                    
                    if (similar.isPresent()) {
                        // Lier le report existant au firebaseId
                        Report report = similar.get();
                        report.setFirebaseId(firebaseId);
                        updateReportFromFirebase(report, doc);
                        reportRepository.save(report);
                        // Synchroniser photos
                        try {
                            syncPhotosFromFirebase(report, doc);
                        } catch (Exception e) {
                            System.err.println("[PhotoSync] Erreur lors de la synchronisation des photos pour report id=" + report.getId() + ": " + e.getMessage());
                        }
                    } else {
                        // Créer un nouveau report
                        Report report = new Report();
                        report.setFirebaseId(firebaseId);
                        report.setUser(user.get());
                        report.setLatitude(lat);
                        report.setLongitude(lng);
                        report.setDescription(description);
                        report.setStatus(doc.getString("status") != null ? doc.getString("status") : "nouveau");
                        report.setSurface(getBigDecimal(doc, "surface"));
                        report.setBudget(getBigDecimal(doc, "budget"));
                        report.setSyncedAt(LocalDateTime.now());
                        
                        reportRepository.save(report);
                        count++;
                        // Synchroniser photos pour le nouveau report
                        try {
                            syncPhotosFromFirebase(report, doc);
                        } catch (Exception e) {
                            System.err.println("[PhotoSync] Erreur lors de la synchronisation des photos pour report id=" + report.getId() + ": " + e.getMessage());
                        }
                    }
                }
            }
        }
        
        return count;
    }

    // ==========================================
    // PUSH: PostgreSQL → Firebase
    // ==========================================

    public int pushUsersToFirebase() throws ExecutionException, InterruptedException {
        List<User> users = userRepository.findAll();
        int count = 0;

        for (User user : users) {
            Map<String, Object> userData = new HashMap<>();
            userData.put("email", user.getEmail());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            userData.put("role", user.getRole());
            userData.put("updatedAt", FieldValue.serverTimestamp());

            // Vérifier si l'utilisateur a un firebaseUid valide
            boolean hasValidFirebaseUid = user.getFirebaseUid() != null 
                && !user.getFirebaseUid().isEmpty()
                && !user.getFirebaseUid().startsWith("fb_uid_") 
                && !user.getFirebaseUid().startsWith("uid_");

            if (!hasValidFirebaseUid) {
                // Chercher d'abord si un document avec le même email existe dans Firebase
                String userEmail = user.getEmail();
                if (userEmail == null || userEmail.isEmpty()) continue;
                QuerySnapshot emailQuery = getFirestore().collection("users")
                        .whereEqualTo("email", userEmail)
                        .get().get();
                
                if (!emailQuery.isEmpty()) {
                    // Document trouvé par email - lier et mettre à jour
                    DocumentSnapshot existingDoc = emailQuery.getDocuments().get(0);
                    user.setFirebaseUid(existingDoc.getId());
                    userRepository.save(user);
                    
                    // Mettre à jour le document Firebase
                    String existingDocId = existingDoc.getId();
                    if (existingDocId != null) {
                        getFirestore().collection("users").document(existingDocId)
                                .update(userData).get();
                    }
                } else {
                    // Créer un nouveau document dans Firebase
                    userData.put("createdAt", FieldValue.serverTimestamp());
                    DocumentReference docRef = getFirestore().collection("users").document();
                    docRef.set(userData).get();
                    
                    user.setFirebaseUid(docRef.getId());
                    userRepository.save(user);
                    count++;
                }
            } else {
                // L'utilisateur a un firebaseUid valide
                String uid = user.getFirebaseUid();
                if (uid == null || uid.isEmpty()) continue;
                DocumentReference docRef = getFirestore().collection("users").document(uid);
                DocumentSnapshot snapshot = docRef.get().get();
                
                if (snapshot.exists()) {
                    // Mettre à jour dans Firebase
                    docRef.update(userData).get();
                } else {
                    // Le document n'existe pas, le créer avec l'ID existant
                    userData.put("createdAt", FieldValue.serverTimestamp());
                    docRef.set(userData).get();
                    count++;
                }
            }
        }
        
        return count;
    }

    public int pushReportsToFirebase() throws ExecutionException, InterruptedException {
        List<Report> reports = reportRepository.findAll();
        int count = 0;

        for (Report report : reports) {
            User user = report.getUser();
            
            // S'assurer que l'utilisateur a un firebaseUid valide avant de push le report
            if (user == null) continue;

            boolean hasValidFirebaseUid = user.getFirebaseUid() != null
                    && !user.getFirebaseUid().isEmpty()
                    && !user.getFirebaseUid().startsWith("fb_uid_")
                    && !user.getFirebaseUid().startsWith("uid_");

            if (!hasValidFirebaseUid) {
                // Essayer de synchroniser l'utilisateur d'abord
                continue;
            }

            Map<String, Object> reportData = new HashMap<>();
            reportData.put("userId", user.getFirebaseUid());
            reportData.put("userName", (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : ""));
            reportData.put("userEmail", user.getEmail());
            reportData.put("latitude", report.getLatitude() != null ? report.getLatitude().doubleValue() : 0);
            reportData.put("longitude", report.getLongitude() != null ? report.getLongitude().doubleValue() : 0);
            reportData.put("description", report.getDescription());
            reportData.put("status", report.getStatus());
            reportData.put("surface", report.getSurface() != null ? report.getSurface().doubleValue() : null);
            reportData.put("budget", report.getBudget() != null ? report.getBudget().doubleValue() : null);
            reportData.put("updatedAt", FieldValue.serverTimestamp());

            if (report.getFirebaseId() == null || report.getFirebaseId().isEmpty()) {
                // Chercher si un report similaire existe déjà dans Firebase
                String userUid = user.getFirebaseUid();
                if (userUid == null || userUid.isEmpty()) continue;
                QuerySnapshot similarQuery = getFirestore().collection("reports")
                        .whereEqualTo("userId", userUid)
                        .whereEqualTo("latitude", report.getLatitude() != null ? report.getLatitude().doubleValue() : 0)
                        .whereEqualTo("longitude", report.getLongitude() != null ? report.getLongitude().doubleValue() : 0)
                        .get().get();

                if (!similarQuery.isEmpty()) {
                    // Report similaire trouvé - lier et mettre à jour
                    DocumentSnapshot existingDoc = similarQuery.getDocuments().get(0);
                    String existDocId = existingDoc.getId();
                    report.setFirebaseId(existDocId);
                    if (existDocId != null) {
                        getFirestore().collection("reports").document(existDocId)
                                .update(reportData).get();
                    }

                    report.setSyncedAt(LocalDateTime.now());
                    reportRepository.save(report);
                } else {
                    // Créer un nouveau report dans Firebase
                    reportData.put("createdAt", FieldValue.serverTimestamp());
                    DocumentReference docRef = getFirestore().collection("reports").document();
                    docRef.set(reportData).get();

                    report.setFirebaseId(docRef.getId());
                    report.setSyncedAt(LocalDateTime.now());
                    reportRepository.save(report);
                    count++;
                }
            } else {
                // Vérifier si le document existe avant de mettre à jour
                String fbId = report.getFirebaseId();
                if (fbId == null || fbId.isEmpty()) continue;
                DocumentReference docRef = getFirestore().collection("reports").document(fbId);
                DocumentSnapshot snapshot = docRef.get().get();

                if (snapshot.exists()) {
                    docRef.update(reportData).get();
                } else {
                    // Le document n'existe pas, le créer
                    reportData.put("createdAt", FieldValue.serverTimestamp());
                    docRef.set(reportData).get();
                    count++;
                }

                report.setSyncedAt(LocalDateTime.now());
                reportRepository.save(report);
            }
        }
        
        return count;
    }
    // ==========================================

    // SYNCHRONISATION DES PHOTOS
    // ==========================================

    @SuppressWarnings("unchecked")
    private void syncPhotosFromFirebase(Report report, QueryDocumentSnapshot doc) {
        System.out.println("[PhotoSync] Début synchronisation photos pour report firebaseId=" + doc.getId());
        
        // Essayer plusieurs noms de champs possibles pour les photos
        String[] possibleFieldNames = {"photos", "photoUrls", "photoUrl", "imageUrls", "imageUrl", "images"};
        Object photosObj = null;
        
        for (String fieldName : possibleFieldNames) {
            Object obj = doc.getData().get(fieldName);
            if (obj != null) {
                photosObj = obj;
                System.out.println("[PhotoSync] Champ trouvé: " + fieldName + " = " + obj);
                break;
            }
        }
        
        if (photosObj == null) {
            System.out.println("[PhotoSync] Aucun champ photos trouvé dans le document Firebase. Champs disponibles: " + doc.getData().keySet());
            return;
        }

        List<?> photosList = null;
        
        // Gérer le cas où c'est une liste
        if (photosObj instanceof List) {
            photosList = (List<?>) photosObj;
        }
        // Gérer le cas où c'est une seule URL string
        else if (photosObj instanceof String) {
            String singleUrl = (String) photosObj;
            if (!singleUrl.isEmpty()) {
                photosList = Collections.singletonList(singleUrl);
            }
        }
        // Gérer le cas où c'est un objet Map (une seule photo)
        else if (photosObj instanceof Map) {
            photosList = Collections.singletonList(photosObj);
        }
        
        if (photosList == null || photosList.isEmpty()) {
            System.out.println("[PhotoSync] Liste de photos vide ou format non reconnu: " + photosObj.getClass().getName());
            return;
        }

        System.out.println("[PhotoSync] Nombre de photos à synchroniser: " + photosList.size());
        int syncedCount = 0;

        for (Object item : photosList) {
            String photoUrl = null;
            String description = null;

            // Cas 1: L'item est une String (URL directe)
            if (item instanceof String) {
                photoUrl = (String) item;
            }
            // Cas 2: L'item est un Map (objet avec url/photoUrl et description)
            else if (item instanceof Map) {
                Map<String, Object> photoData = (Map<String, Object>) item;
                // Essayer plusieurs clés possibles pour l'URL
                String[] urlKeys = {"url", "photoUrl", "photoURL", "imageUrl", "imageURL", "src", "uri"};
                for (String key : urlKeys) {
                    Object urlObj = photoData.get(key);
                    if (urlObj instanceof String && !((String) urlObj).isEmpty()) {
                        photoUrl = (String) urlObj;
                        break;
                    }
                }
                // Récupérer la description
                Object descObj = photoData.get("description");
                if (descObj instanceof String) {
                    description = (String) descObj;
                }
                
                if (photoUrl == null) {
                    System.out.println("[PhotoSync] Clés disponibles dans l'objet photo: " + photoData.keySet());
                }
            } else {
                System.out.println("[PhotoSync] Format de photo non reconnu: " + (item != null ? item.getClass().getName() : "null"));
            }

            if (photoUrl == null || photoUrl.isEmpty()) {
                System.out.println("[PhotoSync] URL de photo vide ou null, ignorée");
                continue;
            }

            System.out.println("[PhotoSync] Traitement de la photo URL: " + photoUrl);

            // Vérifier si cette photo existe déjà
            boolean exists = photoReportRepository.findByPhotoUrl(photoUrl).isPresent();
            if (exists) {
                System.out.println("[PhotoSync] Photo déjà existante, ignorée: " + photoUrl);
                continue; // Photo déjà synchronisée
            }

            // Créer nouvelle photo
            try {
                PhotoReport photo = new PhotoReport();
                photo.setReport(report);
                photo.setPhotoUrl(photoUrl);
                
                if (description != null) {
                    photo.setDescription(description);
                }

                photo.setUploadedAt(LocalDateTime.now());
                photoReportRepository.save(photo);
                syncedCount++;
                System.out.println("[PhotoSync] Photo sauvegardée avec succès: " + photoUrl);
            } catch (Exception e) {
                System.err.println("[PhotoSync] Erreur lors de la sauvegarde de la photo: " + photoUrl + " - " + e.getMessage());
            }
        }
        
        System.out.println("[PhotoSync] Synchronisation terminée. Photos synchronisées: " + syncedCount + "/" + photosList.size());
    }

    // ==========================================

    // MÉTHODES UTILITAIRES
    // ==========================================

    private void updateUserFromFirebase(User user, QueryDocumentSnapshot doc) {
        if (doc.getString("email") != null) user.setEmail(doc.getString("email"));
        if (doc.getString("firstName") != null) user.setFirstName(doc.getString("firstName"));
        if (doc.getString("lastName") != null) user.setLastName(doc.getString("lastName"));
        if (doc.getString("role") != null) user.setRole(doc.getString("role"));
    }

    private void updateReportFromFirebase(Report report, QueryDocumentSnapshot doc) {
        if (doc.getString("description") != null) report.setDescription(doc.getString("description"));
        if (doc.getString("status") != null) report.setStatus(doc.getString("status"));
        if (doc.contains("latitude")) report.setLatitude(getBigDecimal(doc, "latitude"));
        if (doc.contains("longitude")) report.setLongitude(getBigDecimal(doc, "longitude"));
        if (doc.contains("surface")) report.setSurface(getBigDecimal(doc, "surface"));
        if (doc.contains("budget")) report.setBudget(getBigDecimal(doc, "budget"));
        report.setSyncedAt(LocalDateTime.now());
    }

    private BigDecimal getBigDecimal(QueryDocumentSnapshot doc, String field) {
        Object value = doc.getData().get(field);
        if (value == null) return null;
        if (value instanceof Double) return BigDecimal.valueOf((Double) value);
        if (value instanceof Long) return BigDecimal.valueOf((Long) value);
        if (value instanceof String) return new BigDecimal((String) value);
        return null;
    }
}
