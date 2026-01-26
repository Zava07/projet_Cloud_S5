package com.itu.cloud.service;

import com.itu.cloud.entity.ConfigEntry;
import com.itu.cloud.repository.ConfigEntryRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConfigEntryService {

    private final ConfigEntryRepository configEntryRepository;

    public ConfigEntryService(ConfigEntryRepository configEntryRepository) {
        this.configEntryRepository = configEntryRepository;
    }

    @Transactional(readOnly = true)
    public List<ConfigEntry> findAll() {
        return configEntryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<ConfigEntry> findById(Long id) {
        return configEntryRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<ConfigEntry> findByKey(String key) {
        return configEntryRepository.findByKey(key);
    }

    public ConfigEntry save(ConfigEntry entry) {
        return configEntryRepository.save(entry);
    }

    public void deleteById(Long id) {
        configEntryRepository.deleteById(id);
    }
}
