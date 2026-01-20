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

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
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
}
