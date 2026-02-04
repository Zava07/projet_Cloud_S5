package com.itu.cloud.dto;

import java.util.ArrayList;
import java.util.List;

public class PhotoBatchDTO {
    private Long reportId;
    private List<PhotoItemDTO> photos = new ArrayList<>();

    public PhotoBatchDTO() {}

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public List<PhotoItemDTO> getPhotos() {
        return photos;
    }

    public void setPhotos(List<PhotoItemDTO> photos) {
        this.photos = photos;
    }
}
