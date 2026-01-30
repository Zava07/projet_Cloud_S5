package com.itu.cloud.controller;

import com.itu.cloud.dto.SessionDTO;
import com.itu.cloud.entity.Session;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.SessionService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
                        // successful login: reset attempts and create session
                        userService.resetFailedLoginAttempts(user);
                        Session s = new Session();
                        s.setUser(user);
                        s.setToken(java.util.UUID.randomUUID().toString());
                        s.setExpiresAt(LocalDateTime.now().plusDays(7));
                        Session saved = sessionService.save(s);
                        java.util.Map<String, Object> resp = new java.util.HashMap<>();
                        resp.put("session", EntityToDtoMapper.toSessionDTO(saved));
                        resp.put("user", com.itu.cloud.mapper.EntityToDtoMapper.toUserDTO(user, false, false));
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
}
