package com.itu.cloud.controller;

import com.itu.cloud.dto.SessionDTO;
import com.itu.cloud.entity.Session;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.SessionService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final com.itu.cloud.service.UserService userService;

    public SessionController(SessionService sessionService, com.itu.cloud.service.UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    @GetMapping
    public List<SessionDTO> list() {
        return sessionService.findAll().stream().map(EntityToDtoMapper::toSessionDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDTO> get(@PathVariable Long id) {
        return sessionService.findById(id).map(EntityToDtoMapper::toSessionDTO).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SessionDTO create(@RequestBody Session session) {
        Session saved = sessionService.save(session);
        return EntityToDtoMapper.toSessionDTO(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionDTO> update(@PathVariable Long id, @RequestBody Session session) {
        session.setId(id);
        Session saved = sessionService.save(session);
        return ResponseEntity.ok(EntityToDtoMapper.toSessionDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sessionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // optional: find expired before a cutoff
    @GetMapping("/expired")
    public List<SessionDTO> expired(@RequestParam(required = false) Long beforeEpochMillis) {
        LocalDateTime cutoff = beforeEpochMillis == null ? LocalDateTime.now() : LocalDateTime.ofEpochSecond(beforeEpochMillis/1000,0,java.time.ZoneOffset.UTC);
        return sessionService.findExpired(cutoff).stream().map(EntityToDtoMapper::toSessionDTO).collect(Collectors.toList());
    }

    /**
     * Valide un token de session et retourne les informations de session si valide.
     * Retourne aussi un indicateur si la session est proche de l'expiration.
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateSession(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of(
                "valid", false,
                "error", "Token manquant"
            ));
        }

        return sessionService.validateToken(token)
                .map(session -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("valid", true);
                    response.put("session", EntityToDtoMapper.toSessionDTO(session));
                    response.put("user", EntityToDtoMapper.toUserDTO(session.getUser(), false, false));
                    response.put("nearExpiration", sessionService.isNearExpiration(session));
                    response.put("expiresAt", session.getExpiresAt().toString());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of(
                    "valid", false,
                    "error", "Session expirée ou invalide"
                )));
    }

    /**
     * Rafraîchit une session en prolongeant sa durée de validité.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshSession(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "error", "Token manquant"
            ));
        }

        return sessionService.refreshSession(token)
                .map(session -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("session", EntityToDtoMapper.toSessionDTO(session));
                    response.put("message", "Session prolongée de " + sessionService.getSessionDurationMinutes() + " minutes");
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Session expirée ou invalide"
                )));
    }

    /**
     * Déconnexion - invalide la session actuelle.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Déjà déconnecté"));
        }

        boolean invalidated = sessionService.invalidateSession(token);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", invalidated ? "Session terminée" : "Session déjà expirée"
        ));
    }

    /**
     * Retourne la configuration de durée de session (en minutes).
     */
    @GetMapping("/config")
    public ResponseEntity<?> getSessionConfig() {
        return ResponseEntity.ok(Map.of(
            "durationMinutes", sessionService.getSessionDurationMinutes(),
            "warningThresholdMinutes", sessionService.getWarningThresholdMinutes()
        ));
    }

    /**
     * Nettoie les sessions expirées (endpoint admin).
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<?> cleanupExpiredSessions() {
        int count = sessionService.cleanupExpiredSessions();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "deletedCount", count,
            "message", count + " session(s) expirée(s) supprimée(s)"
        ));
    }

    // Simple login endpoint: accepts { email, mdp }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody com.itu.cloud.dto.LoginRequest req) {
        if (req == null || req.getEmail() == null || req.getMdp() == null) {
            return ResponseEntity.badRequest().body("email and mdp are required");
        }

        return userService.findByEmail(req.getEmail())
                .map(user -> {
                    if (Boolean.TRUE.equals(user.getBlocked())) {
                        return ResponseEntity.status(423).body("Cet utilisateur est bloqué");
                    }
                    // For now compare plaintext mdp to stored passwordHash (which in test data contains placeholder values)
                    // In production replace with proper password hashing (BCrypt) and verification
                    if (user.getPasswordHash() != null && user.getPasswordHash().equals(req.getMdp())) {
                        // successful login: reset attempts and create session with configurable duration
                        userService.resetFailedLoginAttempts(user);
                        Session saved = sessionService.createSession(user);
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("session", EntityToDtoMapper.toSessionDTO(saved));
                        resp.put("user", EntityToDtoMapper.toUserDTO(user, false, false));
                        resp.put("sessionDurationMinutes", sessionService.getSessionDurationMinutes());
                        return ResponseEntity.ok(resp);
                    } else {
                        // register failed attempt via service which may block the user
                        com.itu.cloud.entity.User updated = userService.registerFailedLoginAttempt(user);
                        if (Boolean.TRUE.equals(updated.getBlocked())) {
                            return ResponseEntity.status(423).body("Cet utilisateur est bloqué");
                        }
                        return ResponseEntity.status(401).body("Invalid credentials");
                    }
                })
                .orElse(ResponseEntity.status(401).body("Invalid credentials"));
    }

    /**
     * Extrait le token du header Authorization (supporte "Bearer token" et "token" seul)
     */
    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        if (authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
}
