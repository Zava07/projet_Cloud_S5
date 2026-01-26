package com.itu.cloud.controller;

import com.itu.cloud.dto.SyncLogDTO;
import com.itu.cloud.entity.SyncLog;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.SyncLogService;
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
@RequestMapping("/api/synclogs")
public class SyncLogController {

    private final SyncLogService syncLogService;

    public SyncLogController(SyncLogService syncLogService) {
        this.syncLogService = syncLogService;
    }

    @GetMapping
    public List<SyncLogDTO> list(@RequestParam(required = false) String status) {
        List<SyncLog> list = status != null ? syncLogService.findByStatus(status) : syncLogService.findAll();
        return list.stream().map(EntityToDtoMapper::toSyncLogDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SyncLogDTO> get(@PathVariable Long id) {
        return syncLogService.findById(id).map(EntityToDtoMapper::toSyncLogDTO).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public SyncLogDTO create(@RequestBody SyncLog syncLog) {
        SyncLog saved = syncLogService.save(syncLog);
        return EntityToDtoMapper.toSyncLogDTO(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SyncLogDTO> update(@PathVariable Long id, @RequestBody SyncLog syncLog) {
        syncLog.setId(id);
        SyncLog saved = syncLogService.save(syncLog);
        return ResponseEntity.ok(EntityToDtoMapper.toSyncLogDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        syncLogService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
