package com.itu.cloud.controller;

import com.itu.cloud.dto.PhotoBatchDTO;
import com.itu.cloud.dto.PhotoItemDTO;
import com.itu.cloud.entity.PhotoReport;
import com.itu.cloud.entity.Report;
import com.itu.cloud.service.PhotoReportService;
import com.itu.cloud.service.ReportService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin
@RestController
@RequestMapping("/api/photo-reports")
public class PhotoReportController {

    private final PhotoReportService photoReportService;
    private final ReportService reportService;

    public PhotoReportController(PhotoReportService photoReportService, ReportService reportService) {
        this.photoReportService = photoReportService;
        this.reportService = reportService;
    }

    // 1) Create multiple PhotoReport entries from a JSON payload
    @PostMapping("/batch")
    public ResponseEntity<List<PhotoReport>> createBatch(@RequestBody PhotoBatchDTO batch) {
        if (batch.getReportId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Report report = reportService.findById(batch.getReportId())
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + batch.getReportId()));

        List<PhotoReport> saved = new ArrayList<>();
        for (PhotoItemDTO item : batch.getPhotos()) {
            PhotoReport p = new PhotoReport();
            p.setReport(report);
            p.setPhotoUrl(item.getPhotoUrl());
            p.setDescription(item.getDescription());
            saved.add(photoReportService.save(p));
        }
        return ResponseEntity.ok(saved);
    }

    // 2) Upload files and create PhotoReport entries. Files are stored under ./uploads and returned URL is /uploads/{filename}
    @PostMapping("/upload")
    public ResponseEntity<List<PhotoReport>> uploadFiles(@RequestParam Long reportId, @RequestParam("files") MultipartFile[] files) {
        if (reportId == null) return ResponseEntity.badRequest().build();
        Report report = reportService.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));

        Path uploadDir = Path.of("./uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create upload directory", e);
        }

        List<PhotoReport> saved = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String ext = "";
            String orig = file.getOriginalFilename();
            if (orig != null && orig.contains(".")) {
                ext = orig.substring(orig.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID().toString() + ext;
            Path target = uploadDir.resolve(filename);
            try {
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file", e);
            }

            PhotoReport p = new PhotoReport();
            p.setReport(report);
            p.setPhotoUrl("/uploads/" + filename);
            p.setDescription(null);
            saved.add(photoReportService.save(p));
        }
        return ResponseEntity.ok(saved);
    }

    // 3) List photo reports by report id (return minimal DTO to avoid lazy serialization issues)
    @GetMapping("/report/{reportId}")
    public ResponseEntity<List<PhotoItemDTO>> listByReport(@PathVariable Long reportId) {
        List<PhotoReport> list = photoReportService.findByReportId(reportId);
        List<PhotoItemDTO> dtoList = new java.util.ArrayList<>();
        for (PhotoReport p : list) {
            PhotoItemDTO dto = new PhotoItemDTO();
            dto.setPhotoUrl(p.getPhotoUrl());
            dto.setDescription(p.getDescription());
            dtoList.add(dto);
        }
        return ResponseEntity.ok(dtoList);
    }
}
