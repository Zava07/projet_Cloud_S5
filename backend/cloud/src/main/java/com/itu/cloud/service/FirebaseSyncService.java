package com.itu.cloud.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.itu.cloud.entity.Report;
import com.itu.cloud.entity.User;
import com.itu.cloud.entity.SyncLog;
import com.itu.cloud.entity.PhotoReport;
import com.itu.cloud.repository.ReportRepository;
import com.itu.cloud.repository.UserRepository;
import com.itu.cloud.repository.SyncLogRepository;
import com.itu.cloud.repository.PhotoReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseSyncService {

    private final Firestore firestore;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final SyncLogRepository syncLogRepository;
    private final PhotoReportRepository photoReportRepository;

    public FirebaseSyncService(Firestore firestore, 
                               UserRepository userRepository,
                               ReportRepository reportRepository,
                               SyncLogRepository syncLogRepository,
                               PhotoReportRepository photoReportRepository) {
        this.firestore = firestore;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.syncLogRepository = syncLogRepository;
        this.photoReportRepository = photoReportRepository;
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
            log.setStatus("failed");
            log.setErrorMessage(e.getMessage());
        }

        return syncLogRepository.save(log);
    }

    // ==========================================
    // PULL: Firebase → PostgreSQL
    // ==========================================

    public int pullUsersFromFirebase() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection("users").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        int count = 0;

        for (QueryDocumentSnapshot doc : documents) {
            String firebaseUid = doc.getId();
            String email = doc.getString("email");
            
            // 1. Vérifier par firebaseUid
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
        ApiFuture<QuerySnapshot> future = firestore.collection("reports").get();
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
                // Synchroniser les photos
                syncPhotosFromFirebase(report, doc);
            } else {
                // 2. Vérifier si un report similaire existe (même user, même position, même description)
                String userFirebaseUid = doc.getString("userId");
                Optional<User> user = userRepository.findByFirebaseUid(userFirebaseUid);
                
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
                        // Synchroniser les photos
                        syncPhotosFromFirebase(report, doc);
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
                        
                        Report savedReport = reportRepository.save(report);
                        // Synchroniser les photos
                        syncPhotosFromFirebase(savedReport, doc);
                        count++;
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
                QuerySnapshot emailQuery = firestore.collection("users")
                        .whereEqualTo("email", user.getEmail())
                        .get().get();
                
                if (!emailQuery.isEmpty()) {
                    // Document trouvé par email - lier et mettre à jour
                    DocumentSnapshot existingDoc = emailQuery.getDocuments().get(0);
                    user.setFirebaseUid(existingDoc.getId());
                    userRepository.save(user);
                    
                    // Mettre à jour le document Firebase
                    firestore.collection("users").document(existingDoc.getId())
                            .update(userData).get();
                } else {
                    // Créer un nouveau document dans Firebase
                    userData.put("createdAt", FieldValue.serverTimestamp());
                    DocumentReference docRef = firestore.collection("users").document();
                    docRef.set(userData).get();
                    
                    user.setFirebaseUid(docRef.getId());
                    userRepository.save(user);
                    count++;
                }
            } else {
                // L'utilisateur a un firebaseUid valide
                DocumentReference docRef = firestore.collection("users").document(user.getFirebaseUid());
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

            // Ajouter les photos au report
            List<PhotoReport> photoReports = photoReportRepository.findByReport(report);
            List<Map<String, Object>> photosData = new ArrayList<>();
            for (PhotoReport photo : photoReports) {
                Map<String, Object> photoMap = new HashMap<>();
                photoMap.put("url", photo.getPhotoUrl());
                photoMap.put("description", photo.getDescription());
                photosData.add(photoMap);
            }
            reportData.put("photos", photosData);

            if (report.getFirebaseId() == null || report.getFirebaseId().isEmpty()) {
                // Chercher si un report similaire existe déjà dans Firebase
                QuerySnapshot similarQuery = firestore.collection("reports")
                        .whereEqualTo("userId", user.getFirebaseUid())
                        .whereEqualTo("latitude", report.getLatitude() != null ? report.getLatitude().doubleValue() : 0)
                        .whereEqualTo("longitude", report.getLongitude() != null ? report.getLongitude().doubleValue() : 0)
                        .get().get();

                if (!similarQuery.isEmpty()) {
                    // Report similaire trouvé - lier et mettre à jour
                    DocumentSnapshot existingDoc = similarQuery.getDocuments().get(0);
                    report.setFirebaseId(existingDoc.getId());
                    firestore.collection("reports").document(existingDoc.getId())
                            .update(reportData).get();

                    report.setSyncedAt(LocalDateTime.now());
                    reportRepository.save(report);
                } else {
                    // Créer un nouveau report dans Firebase
                    reportData.put("createdAt", FieldValue.serverTimestamp());
                    DocumentReference docRef = firestore.collection("reports").document();
                    docRef.set(reportData).get();

                    report.setFirebaseId(docRef.getId());
                    report.setSyncedAt(LocalDateTime.now());
                    reportRepository.save(report);
                    count++;
                }
            } else {
                // Vérifier si le document existe avant de mettre à jour
                DocumentReference docRef = firestore.collection("reports").document(report.getFirebaseId());
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

    private void syncPhotosFromFirebase(Report report, QueryDocumentSnapshot doc) {
        // Récupérer le tableau photos du document Firebase
        Object photosObj = doc.get("photos");
        if (photosObj == null) {
            return;
        }

        if (!(photosObj instanceof List)) {
            return;
        }

        List<?> photosList = (List<?>) photosObj;

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
                photoUrl = (String) photoData.get("url");
                if (photoUrl == null) {
                    photoUrl = (String) photoData.get("photoUrl");
                }
                description = (String) photoData.get("description");
            }

            if (photoUrl == null || photoUrl.isEmpty()) {
                continue;
            }

            // Vérifier si cette photo existe déjà
            boolean exists = photoReportRepository.findByPhotoUrl(photoUrl).isPresent();
            if (exists) {
                continue; // Photo déjà synchronisée
            }

            // Créer nouvelle photo
            PhotoReport photo = new PhotoReport();
            photo.setReport(report);
            photo.setPhotoUrl(photoUrl);
            
            if (description != null) {
                photo.setDescription(description);
            }

            photo.setUploadedAt(LocalDateTime.now());
            photoReportRepository.save(photo);
        }
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
        Object value = doc.get(field);
        if (value == null) return null;
        if (value instanceof Double) return BigDecimal.valueOf((Double) value);
        if (value instanceof Long) return BigDecimal.valueOf((Long) value);
        if (value instanceof String) return new BigDecimal((String) value);
        return null;
    }
}
