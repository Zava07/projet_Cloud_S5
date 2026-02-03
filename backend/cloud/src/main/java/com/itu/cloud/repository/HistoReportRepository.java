package com.itu.cloud.repository;

import com.itu.cloud.entity.HistoReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoReportRepository extends JpaRepository<HistoReport, Long> {

    List<HistoReport> findByReportId(Long reportId);

    List<HistoReport> findByStatus(String status);
}
