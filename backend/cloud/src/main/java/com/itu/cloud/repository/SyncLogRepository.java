package com.itu.cloud.repository;

import com.itu.cloud.entity.SyncLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {

    List<SyncLog> findByStatus(String status);
}
