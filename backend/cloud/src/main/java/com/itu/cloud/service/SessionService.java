package com.itu.cloud.service;

import com.itu.cloud.entity.Session;
import com.itu.cloud.repository.SessionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
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
}
