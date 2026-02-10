package com.itu.cloud.service;

import com.itu.cloud.config.SessionConfig;
import com.itu.cloud.entity.Session;
import com.itu.cloud.entity.User;
import com.itu.cloud.repository.SessionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionConfig sessionConfig;

    public SessionService(SessionRepository sessionRepository, SessionConfig sessionConfig) {
        this.sessionRepository = sessionRepository;
        this.sessionConfig = sessionConfig;
    }

    @Transactional(readOnly = true)
    public List<Session> findAll() {
        return sessionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Session> findById(Long id) {
        return sessionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Session> findByToken(String token) {
        return sessionRepository.findByToken(token);
    }

    public Session save(Session session) {
        return sessionRepository.save(session);
    }

    public void deleteById(Long id) {
        sessionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Session> findExpired(LocalDateTime cutoff) {
        return sessionRepository.findByExpiresAtBefore(cutoff);
    }

    /**
     * Crée une nouvelle session pour un utilisateur avec la durée configurée.
     */
    public Session createSession(User user) {
        Session session = new Session();
        session.setUser(user);
        session.setToken(UUID.randomUUID().toString());
        session.setExpiresAt(LocalDateTime.now().plusMinutes(sessionConfig.getDurationMinutes()));
        return sessionRepository.save(session);
    }

    /**
     * Valide un token de session et retourne la session si elle est valide et non expirée.
     * 
     * @param token Le token de session à valider
     * @return Optional contenant la session si valide, vide sinon
     */
    @Transactional(readOnly = true)
    public Optional<Session> validateToken(String token) {
        return sessionRepository.findByToken(token)
                .filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    /**
     * Vérifie si une session est proche de l'expiration.
     * 
     * @param session La session à vérifier
     * @return true si la session expire dans les prochaines X minutes (configurable)
     */
    public boolean isNearExpiration(Session session) {
        LocalDateTime warningThreshold = LocalDateTime.now()
                .plusMinutes(sessionConfig.getWarningThresholdMinutes());
        return session.getExpiresAt().isBefore(warningThreshold);
    }

    /**
     * Rafraîchit une session en prolongeant sa durée de validité.
     * 
     * @param token Le token de la session à rafraîchir
     * @return Optional contenant la session rafraîchie si elle existe et est valide
     */
    public Optional<Session> refreshSession(String token) {
        return sessionRepository.findByToken(token)
                .filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(session -> {
                    session.setExpiresAt(LocalDateTime.now().plusMinutes(sessionConfig.getDurationMinutes()));
                    return sessionRepository.save(session);
                });
    }

    /**
     * Invalide (supprime) une session par son token.
     * 
     * @param token Le token de la session à invalider
     * @return true si la session a été supprimée, false si elle n'existait pas
     */
    public boolean invalidateSession(String token) {
        return sessionRepository.findByToken(token)
                .map(session -> {
                    sessionRepository.delete(session);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Invalide toutes les sessions d'un utilisateur.
     * 
     * @param userId L'ID de l'utilisateur
     */
    public void invalidateAllUserSessions(Long userId) {
        List<Session> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getUser() != null && s.getUser().getId().equals(userId))
                .toList();
        sessionRepository.deleteAll(sessions);
    }

    /**
     * Supprime toutes les sessions expirées.
     * 
     * @return Le nombre de sessions supprimées
     */
    public int cleanupExpiredSessions() {
        List<Session> expired = sessionRepository.findByExpiresAtBefore(LocalDateTime.now());
        sessionRepository.deleteAll(expired);
        return expired.size();
    }

    /**
     * Retourne la durée de session configurée en minutes.
     */
    public int getSessionDurationMinutes() {
        return sessionConfig.getDurationMinutes();
    }

    /**
     * Retourne le seuil d'avertissement configuré en minutes.
     */
    public int getWarningThresholdMinutes() {
        return sessionConfig.getWarningThresholdMinutes();
    }
}
