package com.itu.cloud.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReportSummaryDTO {
    private Long id;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal budget;
    private String status;
    private LocalDateTime createdAt;
    private EntrepriseSummaryDTO entreprise;
    private Integer niveau;
    
    public ReportSummaryDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public EntrepriseSummaryDTO getEntreprise() { return entreprise; }
    public void setEntreprise(EntrepriseSummaryDTO entreprise) { this.entreprise = entreprise; }

    public Integer getNiveau() { return niveau; }
    public void setNiveau(Integer niveau) { this.niveau = niveau; }
}
