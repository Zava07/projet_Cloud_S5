package com.itu.cloud.service;

import com.itu.cloud.entity.HistoReport;
import com.itu.cloud.repository.HistoReportRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HistoReportService {

    private final HistoReportRepository histoReportRepository;

    public HistoReportService(HistoReportRepository histoReportRepository) {
        this.histoReportRepository = histoReportRepository;
    }

    @Transactional(readOnly = true)
    public List<HistoReport> findAll() {
        return histoReportRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<HistoReport> findById(Long id) {
        return histoReportRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<HistoReport> findByReportId(Long reportId) {
        return histoReportRepository.findByReportId(reportId);
    }

    @Transactional(readOnly = true)
    public List<HistoReport> findByStatus(String status) {
        return histoReportRepository.findByStatus(status);
    }

    public HistoReport save(HistoReport histoReport) {
        return histoReportRepository.save(histoReport);
    }

    public void deleteById(Long id) {
        histoReportRepository.deleteById(id);
    }
}
