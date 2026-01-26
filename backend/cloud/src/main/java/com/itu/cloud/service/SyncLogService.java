package com.itu.cloud.service;

import com.itu.cloud.entity.SyncLog;
import com.itu.cloud.repository.SyncLogRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SyncLogService {

    private final SyncLogRepository syncLogRepository;

    public SyncLogService(SyncLogRepository syncLogRepository) {
        this.syncLogRepository = syncLogRepository;
    }

    @Transactional(readOnly = true)
    public List<SyncLog> findAll() {
        return syncLogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<SyncLog> findById(Long id) {
        return syncLogRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<SyncLog> findByStatus(String status) {
        return syncLogRepository.findByStatus(status);
    }

    public SyncLog save(SyncLog syncLog) {
        return syncLogRepository.save(syncLog);
    }

    public void deleteById(Long id) {
        syncLogRepository.deleteById(id);
    }
}
