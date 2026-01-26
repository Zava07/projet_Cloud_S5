package com.itu.cloud.repository;

import com.itu.cloud.entity.Report;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByStatus(String status);

    List<Report> findByUserId(Long userId);

    Optional<Report> findByFirebaseId(String firebaseId);
}
