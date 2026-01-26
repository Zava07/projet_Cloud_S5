package com.itu.cloud.dto;

import java.time.LocalDateTime;

public class EntrepriseSummaryDTO {
    private Long id;
    private String nom;
    private String contact;
    private String email;
    private LocalDateTime createdAt;

    public EntrepriseSummaryDTO() {}

    public EntrepriseSummaryDTO(Long id, String nom, String contact, String email, LocalDateTime createdAt) {
        this.id = id;
        this.nom = nom;
        this.contact = contact;
        this.email = email;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
