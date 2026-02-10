package com.itu.cloud.controller;

import com.itu.cloud.entity.SyncLog;
import com.itu.cloud.dto.SyncLogDTO;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.entity.User;
import com.itu.cloud.service.FirebaseSyncService;
import com.itu.cloud.service.SyncLogService;
import com.itu.cloud.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final FirebaseSyncService firebaseSyncService;
    private final SyncLogService syncLogService;
    private final UserService userService;

    public SyncController(FirebaseSyncService firebaseSyncService, 
                         SyncLogService syncLogService,
                         UserService userService) {
        this.firebaseSyncService = firebaseSyncService;
        this.syncLogService = syncLogService;
        this.userService = userService;
    }

    /**
     * Synchronisation complète bidirectionnelle Firebase ↔ PostgreSQL
     */
    @PostMapping("/full")
    public ResponseEntity<Map<String, Object>> syncAll(@RequestParam(required = false) Long userId) {
        try {
            User syncedBy = null;
            if (userId != null) {
                syncedBy = userService.findById(userId).orElse(null);
            }
            
            SyncLog result = firebaseSyncService.syncAll(syncedBy);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", result.getStatus());
            response.put("recordsPulled", result.getRecordsPulled());
            response.put("recordsPushed", result.getRecordsPushed());
            response.put("conflicts", result.getConflicts());
            response.put("syncedAt", result.getSyncedAt());
            response.put("message", "Synchronisation terminée");
            
            if ("failed".equals(result.getStatus())) {
                response.put("error", result.getErrorMessage());
                return ResponseEntity.status(500).body(response);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "failed");
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Pull: Firebase → PostgreSQL (importer les données de Firebase)
     */
    @PostMapping("/pull")
    public ResponseEntity<Map<String, Object>> pullFromFirebase() {
        try {
            int usersPulled = firebaseSyncService.pullUsersFromFirebase();
            int reportsPulled = firebaseSyncService.pullReportsFromFirebase();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("usersPulled", usersPulled);
            response.put("reportsPulled", reportsPulled);
            response.put("message", "Données importées depuis Firebase");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "failed");
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Push: PostgreSQL → Firebase (exporter les données vers Firebase)
     */
    @PostMapping("/push")
    public ResponseEntity<Map<String, Object>> pushToFirebase() {
        try {
            int usersPushed = firebaseSyncService.pushUsersToFirebase();
            int reportsPushed = firebaseSyncService.pushReportsToFirebase();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("usersPushed", usersPushed);
            response.put("reportsPushed", reportsPushed);
            response.put("message", "Données exportées vers Firebase");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "failed");
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * Historique des synchronisations
     */
    @GetMapping("/logs")
    public ResponseEntity<List<SyncLogDTO>> getSyncLogs() {
        List<SyncLog> logs = syncLogService.findAll();
        List<SyncLogDTO> dtoList = logs.stream()
                .map(EntityToDtoMapper::toSyncLogDTO)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    /**
     * Statut de la synchronisation
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("firebaseConfigured", true);
        status.put("lastSync", syncLogService.findAll().stream()
                .findFirst()
                .map(SyncLog::getSyncedAt)
                .orElse(null));
        return ResponseEntity.ok(status);
    }
}
