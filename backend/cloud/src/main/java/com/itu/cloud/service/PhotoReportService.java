package com.itu.cloud.service;

import com.itu.cloud.entity.PhotoReport;
import com.itu.cloud.entity.Report;
import com.itu.cloud.repository.PhotoReportRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PhotoReportService {

    private final PhotoReportRepository photoReportRepository;

    public PhotoReportService(PhotoReportRepository photoReportRepository) {
        this.photoReportRepository = photoReportRepository;
    }

    @Transactional(readOnly = true)
    public List<PhotoReport> findAll() {
        return photoReportRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<PhotoReport> findById(Long id) {
        return photoReportRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<PhotoReport> findByReportId(Long reportId) {
        return photoReportRepository.findByReportId(reportId);
    }

    @Transactional(readOnly = true)
    public List<PhotoReport> findByReport(Report report) {
        return photoReportRepository.findByReport(report);
    }

    public PhotoReport save(PhotoReport photoReport) {
        return photoReportRepository.save(photoReport);
    }

    public void deleteById(Long id) {
        photoReportRepository.deleteById(id);
    }
}
