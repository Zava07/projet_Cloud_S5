package com.itu.cloud.controller;

import com.itu.cloud.dto.ConfigEntryDTO;
import com.itu.cloud.entity.ConfigEntry;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.ConfigEntryService;
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
@RequestMapping("/api/config")
public class ConfigEntryController {

    private final ConfigEntryService configEntryService;

    public ConfigEntryController(ConfigEntryService configEntryService) {
        this.configEntryService = configEntryService;
    }

    @GetMapping
    public List<ConfigEntryDTO> list(@RequestParam(required = false) String key) {
        List<ConfigEntry> entries = key != null ? configEntryService.findByKey(key).map(List::of).orElse(List.of()) : configEntryService.findAll();
        return entries.stream().map(EntityToDtoMapper::toConfigEntryDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConfigEntryDTO> get(@PathVariable Long id) {
        return configEntryService.findById(id).map(EntityToDtoMapper::toConfigEntryDTO).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ConfigEntryDTO create(@RequestBody ConfigEntry entry) {
        ConfigEntry saved = configEntryService.save(entry);
        return EntityToDtoMapper.toConfigEntryDTO(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfigEntryDTO> update(@PathVariable Long id, @RequestBody ConfigEntry entry) {
        entry.setId(id);
        ConfigEntry saved = configEntryService.save(entry);
        return ResponseEntity.ok(EntityToDtoMapper.toConfigEntryDTO(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        configEntryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
