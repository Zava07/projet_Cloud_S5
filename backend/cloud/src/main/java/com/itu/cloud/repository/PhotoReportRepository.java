package com.itu.cloud.repository;

import com.itu.cloud.entity.PhotoReport;
import com.itu.cloud.entity.Report;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoReportRepository extends JpaRepository<PhotoReport, Long> {

    List<PhotoReport> findByReportId(Long reportId);

    List<PhotoReport> findByReport(Report report);

    Optional<PhotoReport> findByPhotoUrl(String photoUrl);
}
