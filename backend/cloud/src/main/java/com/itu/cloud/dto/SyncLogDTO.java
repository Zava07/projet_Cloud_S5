package com.itu.cloud.dto;

import java.time.LocalDateTime;

public class SyncLogDTO {
    private Long id;
    private String action;
    private LocalDateTime createdAt;
    private Long syncedByUserId;

    public SyncLogDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getSyncedByUserId() {
        return syncedByUserId;
    }

    public void setSyncedByUserId(Long syncedByUserId) {
        this.syncedByUserId = syncedByUserId;
    }
}
