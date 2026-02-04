package com.itu.cloud.dto;

public class PhotoItemDTO {
    private String photoUrl;
    private String description;

    public PhotoItemDTO() {}

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
