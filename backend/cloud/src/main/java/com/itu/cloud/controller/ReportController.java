package com.itu.cloud.controller;

import com.itu.cloud.dto.ReportSummaryDTO;
import com.itu.cloud.entity.Entreprise;
import com.itu.cloud.entity.HistoReport;
import com.itu.cloud.entity.Report;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.ReportService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
import com.itu.cloud.service.HistoReportService;

@CrossOrigin
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    private final EntrepriseService entrepriseService;

    private final HistoReportService histoReportService;

    public ReportController(ReportService reportService , EntrepriseService entrepriseService, HistoReportService histoReportService) {
        this.reportService = reportService;
        this.entrepriseService = entrepriseService;
        this.histoReportService = histoReportService;
    }

    @GetMapping("/stats")
    public java.util.Map<String, Object> stats() {
        // Compute average processing time between first en_cours and termine for reports that have both
        java.util.List<Report> all = reportService.findAll();
        long totalSeconds = 0L;
        int count = 0;
        for (Report r : all) {
            java.util.List<HistoReport> history = histoReportService.findByReportId(r.getId());
            java.time.LocalDateTime enCoursAt = null;
            java.time.LocalDateTime termineAt = null;
            for (HistoReport h : history) {
                String s = h.getStatus();
                if (s == null) continue;
                if (s.equalsIgnoreCase("en_cours") || s.equalsIgnoreCase("en-cours")) {
                    if (enCoursAt == null || h.getDateChangement().isBefore(enCoursAt)) enCoursAt = h.getDateChangement();
                }
                if (s.equalsIgnoreCase("termine") || s.equalsIgnoreCase("terminer")) {
                    if (termineAt == null || h.getDateChangement().isAfter(termineAt)) termineAt = h.getDateChangement();
                    termineAt = h.getDateChangement();
                }
            }
            if (enCoursAt != null && termineAt != null && termineAt.isAfter(enCoursAt)) {
                totalSeconds += java.time.Duration.between(enCoursAt, termineAt).getSeconds();
                count++;
            }
        }
        double avgSeconds = count > 0 ? (double) totalSeconds / count : 0.0;
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("average_processing_seconds", avgSeconds);
        result.put("count_processed", count);
        return result;
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
        HistoReport histoReport = new HistoReport();
        histoReport.setReport(report);
        histoReport.setStatus(report.getStatus());
        histoReport.setDateChangement(LocalDateTime.now());
        histoReportService.save(histoReport);
        return EntityToDtoMapper.toReportSummary(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportSummaryDTO> update(@PathVariable Long id, @RequestBody Report report) {
        report.setId(id);
        Report saved = reportService.save(report);
        HistoReport histoReport = new HistoReport();
        histoReport.setReport(report);
        histoReport.setStatus(report.getStatus());
        histoReport.setDateChangement(LocalDateTime.now());
        histoReportService.save(histoReport);
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
    public ReportSummaryDTO doReport(@RequestParam long id_report , @RequestParam long id_entreprise  , @RequestParam BigDecimal  budget , @RequestParam(name = "date_changement", required = false) String dateString) {

        LocalDateTime dateChangement = parseDateString(dateString);

        if(id_report == 0){
            throw new IllegalArgumentException("L'identifiant du rapport ne peut pas être nul ou zéro.");
        }
        if(dateChangement == null){
            throw new IllegalArgumentException("La date de changement ne peut pas être nulle.");
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

        HistoReport histoReport = new HistoReport();
        histoReport.setReport(report);
        histoReport.setStatus(report.getStatus());
        histoReport.setDateChangement(dateChangement);
        histoReportService.save(histoReport);
        return EntityToDtoMapper.toReportSummary(saved);
    }

    @PostMapping("/finish-report")
    public ReportSummaryDTO finishReport(@RequestParam long id_report , @RequestParam(name = "date_changement", required = false) String dateString) {
        if(id_report == 0){
            throw new IllegalArgumentException("L'identifiant du rapport ne peut pas être nul ou zéro.");
        }
        Report report  = reportService.findById(id_report)
                .orElseThrow(() -> new IllegalArgumentException("Rapport avec l'identifiant " + id_report + " non trouvée."));
        report.setStatus("termine");
        Report saved = reportService.save(report);
        LocalDateTime dateChangement = parseDateString(dateString);
        HistoReport histoReport = new HistoReport();
        histoReport.setReport(report);
        histoReport.setStatus(report.getStatus());
        histoReport.setDateChangement(dateChangement);
        histoReportService.save(histoReport);
        return EntityToDtoMapper.toReportSummary(saved);
    }

    private LocalDateTime parseDateString(String dateString) {
        if (dateString == null || dateString.isBlank()) return null;
        // Try ISO parse first
        try {
            return LocalDateTime.parse(dateString);
        } catch (DateTimeParseException e) {
            // try replacing space with 'T' (e.g. 'yyyy-MM-dd HH:mm:ss[.nnnnnn]')
            try {
                return LocalDateTime.parse(dateString.replace(' ', 'T'));
            } catch (DateTimeParseException e2) {
                // try with microseconds fraction (6 digits)
                try {
                    DateTimeFormatter fmtMicro = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");
                    return LocalDateTime.parse(dateString, fmtMicro);
                } catch (DateTimeParseException e3) {
                    // try without fraction
                    try {
                        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                        return LocalDateTime.parse(dateString, fmt);
                    } catch (DateTimeParseException e4) {
                        // try date only
                        try {
                            LocalDate ld = LocalDate.parse(dateString);
                            return ld.atStartOfDay();
                        } catch (DateTimeParseException e5) {
                            throw new IllegalArgumentException("Format de date invalide: " + dateString);
                        }
                    }
                }
            }
        }
    }
}
