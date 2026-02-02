package com.itu.cloud.controller;

import com.itu.cloud.dto.EntrepriseSummaryDTO;
import com.itu.cloud.dto.ReportSummaryDTO;
import com.itu.cloud.entity.Entreprise;
import com.itu.cloud.entity.User;
import com.itu.cloud.mapper.EntityToDtoMapper;
import com.itu.cloud.service.EntrepriseService;
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
@RequestMapping("/api/entreprises")
public class EntrepriseController {

    private final EntrepriseService entrepriseService;

    public EntrepriseController(EntrepriseService entrepriseService) {
        this.entrepriseService = entrepriseService;
    }

    @GetMapping
    public List<Entreprise> list() {
        return entrepriseService.findAll();
    }

    @GetMapping("/summaries")
    public List<EntrepriseSummaryDTO> listSummaries() {
        List<Entreprise> entreprises = entrepriseService.findAll();
        return entreprises.stream()
                .map(EntityToDtoMapper::toEntrepriseSummary)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntrepriseSummaryDTO> get(@PathVariable Long id,
                                                    @RequestParam(name = "includeReports", defaultValue = "false") boolean includeReports) {
        return entrepriseService.findById(id)
                .map(e -> {
                    EntrepriseSummaryDTO dto = EntityToDtoMapper.toEntrepriseSummary(e);
                    if (includeReports && e.getReports() != null) {
                        dto.setCreatedAt(e.getCreatedAt());
                    }
                    return dto;
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EntrepriseSummaryDTO create(@RequestBody Entreprise entreprise) {
        Entreprise saved = entrepriseService.save(entreprise);
        return EntityToDtoMapper.toEntrepriseSummary(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntrepriseSummaryDTO> update(@PathVariable Long id, @RequestBody Entreprise entreprise) {
        entreprise.setId(id);
        Entreprise saved = entrepriseService.save(entreprise);
        return ResponseEntity.ok(EntityToDtoMapper.toEntrepriseSummary(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        entrepriseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/users")
    public List<com.itu.cloud.dto.UserDTO> users(@PathVariable Long id) {
        List<User> users = entrepriseService.findUsers(id);
        return users.stream().map(u -> EntityToDtoMapper.toUserDTO(u, false, false)).collect(Collectors.toList());
    }
}
