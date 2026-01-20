package com.itu.cloud.service;

import com.itu.cloud.entity.Report;
import com.itu.cloud.repository.ReportRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Transactional(readOnly = true)
    public List<Report> findAll() {
        return reportRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Report> findById(Long id) {
        return reportRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Report> findByStatus(String status) {
        return reportRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Report> findByUserId(Long userId) {
        return reportRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Report> findByFirebaseId(String firebaseId) {
        return reportRepository.findByFirebaseId(firebaseId);
    }

    public Report save(Report report) {
        return reportRepository.save(report);
    }

    public void deleteById(Long id) {
        reportRepository.deleteById(id);
    }
}
