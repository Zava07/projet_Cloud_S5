package com.itu.cloud.controller;

import com.itu.cloud.dto.ReportSummaryDTO;
import com.itu.cloud.entity.Entreprise;
import com.itu.cloud.entity.Report;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.ReportService;

import java.math.BigDecimal;
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
import com.itu.cloud.service.EntrepriseService; 

@CrossOrigin
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    private final EntrepriseService entrepriseService;

    public ReportController(ReportService reportService , EntrepriseService entrepriseService) {
        this.reportService = reportService;
        this.entrepriseService = entrepriseService;
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

    @GetMapping("/nouveau")
    public List<ReportSummaryDTO> listNouveauReports() {
        List<Report> reports = reportService.findByStatus("nouveau");
        return reports.stream().map(EntityToDtoMapper::toReportSummary).collect(Collectors.toList());
    }

    @GetMapping("/en-cours")
    public List<ReportSummaryDTO> listEnCoursReports() {
        List<Report> reports = reportService.findByStatus("en-cours");
        return reports.stream().map(EntityToDtoMapper::toReportSummary).collect(Collectors.toList());
    }
    @GetMapping("/termine")
    public List<ReportSummaryDTO> listTermineReports() {
        List<Report> reports = reportService.findByStatus("termine");
        return reports.stream().map(EntityToDtoMapper::toReportSummary).collect(Collectors.toList());
    }

    
    @PostMapping("/do-report")
    public ReportSummaryDTO doReport(@RequestParam long id_report , @RequestParam long id_entreprise  , @RequestParam BigDecimal  budget) {

        if(id_report == 0){
            throw new IllegalArgumentException("L'identifiant du rapport ne peut pas être nul ou zéro.");
        }
        Report report  = reportService.findById(id_report)
                .orElseThrow(() -> new IllegalArgumentException("Rapport avec l'identifiant " + id_report + " non trouvée."));

        report.setStatus("en_cours");
        report.setBudget(budget);
        if(id_entreprise == 0){
            throw new IllegalArgumentException("L'identifiant de l'entreprise ne peut pas être nul ou zéro.");
        }

        Entreprise e  = entrepriseService.findById(id_entreprise)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise avec l'identifiant " + id_entreprise + " non trouvée."));
        report.setEntreprise(e);
        Report saved = reportService.save(report);
        return EntityToDtoMapper.toReportSummary(saved);
    }

    @PostMapping("/finish-report")
    public ReportSummaryDTO finishReport(@RequestParam long id_report ) {
        if(id_report == 0){
            throw new IllegalArgumentException("L'identifiant du rapport ne peut pas être nul ou zéro.");
        }
        Report report  = reportService.findById(id_report)
                .orElseThrow(() -> new IllegalArgumentException("Rapport avec l'identifiant " + id_report + " non trouvée."));
        report.setStatus("termine");
        Report saved = reportService.save(report);
        return EntityToDtoMapper.toReportSummary(saved);
    }
}
