package com.itu.cloud.repository;

import com.itu.cloud.entity.Session;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, Long> {

    Optional<Session> findByToken(String token);

    List<Session> findByExpiresAtBefore(LocalDateTime cutoff);
}
