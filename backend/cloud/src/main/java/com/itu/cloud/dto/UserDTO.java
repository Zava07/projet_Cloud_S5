package com.itu.cloud.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class UserDTO {
    private Long id;
    private String firebaseUid;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Boolean blocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<EntrepriseSummaryDTO> entreprises = new ArrayList<>();
    private List<ReportSummaryDTO> reports = new ArrayList<>();

    public UserDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirebaseUid() {
        return firebaseUid;
    }

    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getBlocked() {
        return blocked;
    }

    public void setBlocked(Boolean blocked) {
        this.blocked = blocked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<EntrepriseSummaryDTO> getEntreprises() {
        return entreprises;
    }

    public void setEntreprises(List<EntrepriseSummaryDTO> entreprises) {
        this.entreprises = entreprises;
    }

    public List<ReportSummaryDTO> getReports() {
        return reports;
    }

    public void setReports(List<ReportSummaryDTO> reports) {
        this.reports = reports;
    }
        public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
