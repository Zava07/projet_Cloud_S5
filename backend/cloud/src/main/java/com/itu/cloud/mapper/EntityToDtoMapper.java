package com.itu.cloud.mapper;

import com.itu.cloud.dto.ConfigEntryDTO;
import com.itu.cloud.dto.EntrepriseSummaryDTO;
import com.itu.cloud.dto.ReportSummaryDTO;
import com.itu.cloud.dto.SessionDTO;
import com.itu.cloud.dto.SyncLogDTO;
import com.itu.cloud.dto.UserDTO;
import com.itu.cloud.entity.ConfigEntry;
import com.itu.cloud.entity.Entreprise;
import com.itu.cloud.entity.Report;
import com.itu.cloud.entity.Session;
import com.itu.cloud.entity.SyncLog;
import com.itu.cloud.entity.User;
import java.util.ArrayList;
import java.util.List;

public class EntityToDtoMapper {

    public static EntrepriseSummaryDTO toEntrepriseSummary(Entreprise e) {
        if (e == null) return null;
        return new EntrepriseSummaryDTO(e.getId(), e.getNom(), e.getContact(), e.getEmail(), e.getCreatedAt());
    }

    public static ReportSummaryDTO toReportSummary(Report r) {
        if (r == null) return null;
        ReportSummaryDTO dto = new ReportSummaryDTO();
        dto.setId(r.getId());
        dto.setDescription(r.getDescription());
        dto.setLatitude(r.getLatitude());
        dto.setLongitude(r.getLongitude());
        dto.setBudget(r.getBudget());
        dto.setStatus(r.getStatus());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setEntreprise(toEntrepriseSummary(r.getEntreprise()));
        return dto;
    }

    public static UserDTO toUserDTO(User u, boolean includeEntreprises, boolean includeReports) {
        if (u == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(u.getId());
        dto.setFirebaseUid(u.getFirebaseUid());
        dto.setEmail(u.getEmail());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        dto.setBlocked(u.getBlocked());
        dto.setCreatedAt(u.getCreatedAt());

        if (includeEntreprises && u.getEntreprises() != null) {
            List<EntrepriseSummaryDTO> list = new ArrayList<>();
            for (Entreprise e : u.getEntreprises()) {
                list.add(toEntrepriseSummary(e));
            }
            dto.setEntreprises(list);
        }

        if (includeReports && u.getReports() != null) {
            List<ReportSummaryDTO> rs = new ArrayList<>();
            for (Report r : u.getReports()) {
                rs.add(toReportSummary(r));
            }
            dto.setReports(rs);
        }

        return dto;
    }

    public static SessionDTO toSessionDTO(Session s) {
        if (s == null) return null;
        SessionDTO dto = new SessionDTO();
        dto.setId(s.getId());
        dto.setToken(s.getToken());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setExpiresAt(s.getExpiresAt());
        return dto;
    }

    public static SyncLogDTO toSyncLogDTO(SyncLog s) {
        if (s == null) return null;
        SyncLogDTO dto = new SyncLogDTO();
        dto.setId(s.getId());
        dto.setAction(s.getSyncType());
        dto.setCreatedAt(s.getSyncedAt());
        dto.setSyncedByUserId(s.getSyncedBy() != null ? s.getSyncedBy().getId() : null);
        return dto;
    }

    public static ConfigEntryDTO toConfigEntryDTO(ConfigEntry c) {
        if (c == null) return null;
        ConfigEntryDTO dto = new ConfigEntryDTO();
        dto.setId(c.getId());
        dto.setKey(c.getKey());
        dto.setValue(c.getValue());
        return dto;
    }
}
