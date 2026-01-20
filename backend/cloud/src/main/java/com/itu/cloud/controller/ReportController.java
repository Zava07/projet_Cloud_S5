package com.itu.cloud.controller;

import com.itu.cloud.dto.ReportSummaryDTO;
import com.itu.cloud.entity.Report;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.ReportService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public List<ReportSummaryDTO> list(@RequestParam(required = false) String status,
                                       @RequestParam(required = false) Long userId) {
        List<Report> reports;
        if (status != null) reports = reportService.findByStatus(status);
        else if (userId != null) reports = reportService.findByUserId(userId);
        else reports = reportService.findAll();
        return reports.stream().map(EntityToDtoMapper::toReportSummary).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportSummaryDTO> get(@PathVariable Long id) {
        return reportService.findById(id)
                .map(EntityToDtoMapper::toReportSummary)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ReportSummaryDTO create(@RequestBody Report report) {
        Report saved = reportService.save(report);
        return EntityToDtoMapper.toReportSummary(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportSummaryDTO> update(@PathVariable Long id, @RequestBody Report report) {
        report.setId(id);
        Report saved = reportService.save(report);
        return ResponseEntity.ok(EntityToDtoMapper.toReportSummary(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reportService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
