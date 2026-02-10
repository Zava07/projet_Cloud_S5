package com.itu.cloud.dto;

import java.time.LocalDateTime;

public class SyncLogDTO {
    private Long id;
    private String syncType;
    private LocalDateTime syncedAt;
    private Integer recordsPulled;
    private Integer recordsPushed;
    private Integer conflicts;
    private String status;
    private String errorMessage;
    private Long syncedByUserId;

    public SyncLogDTO() {
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

    public LocalDateTime getSyncedAt() {
        return syncedAt;
    }

    public void setSyncedAt(LocalDateTime syncedAt) {
        this.syncedAt = syncedAt;
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

    public Long getSyncedByUserId() {
        return syncedByUserId;
    }

    public void setSyncedByUserId(Long syncedByUserId) {
        this.syncedByUserId = syncedByUserId;
    }
}
