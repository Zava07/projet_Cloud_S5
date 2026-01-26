package com.itu.cloud.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "sync_log")
public class SyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sync_type", length = 20)
    private String syncType;

    @Column(name = "records_pulled")
    private Integer recordsPulled = 0;

    @Column(name = "records_pushed")
    private Integer recordsPushed = 0;

    @Column
    private Integer conflicts = 0;

    @Column(length = 20)
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "synced_by")
    private User syncedBy;

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    public SyncLog() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSyncType() {
        return syncType;
    }

    public void setSyncType(String syncType) {
        this.syncType = syncType;
    }

    public Integer getRecordsPulled() {
        return recordsPulled;
    }

    public void setRecordsPulled(Integer recordsPulled) {
        this.recordsPulled = recordsPulled;
    }

    public Integer getRecordsPushed() {
        return recordsPushed;
    }

    public void setRecordsPushed(Integer recordsPushed) {
        this.recordsPushed = recordsPushed;
    }

    public Integer getConflicts() {
        return conflicts;
    }

    public void setConflicts(Integer conflicts) {
        this.conflicts = conflicts;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public User getSyncedBy() {
        return syncedBy;
    }

    public void setSyncedBy(User syncedBy) {
        this.syncedBy = syncedBy;
    }

    public LocalDateTime getSyncedAt() {
        return syncedAt;
    }

    public void setSyncedAt(LocalDateTime syncedAt) {
        this.syncedAt = syncedAt;
    }

    @PrePersist
    public void prePersist() {
        if (recordsPulled == null) {
            recordsPulled = 0;
        }
        if (recordsPushed == null) {
            recordsPushed = 0;
        }
        if (conflicts == null) {
            conflicts = 0;
        }
        if (syncedAt == null) {
            syncedAt = LocalDateTime.now();
        }
    }
}
