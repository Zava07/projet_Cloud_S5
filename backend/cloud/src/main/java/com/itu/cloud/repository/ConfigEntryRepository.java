package com.itu.cloud.repository;

import com.itu.cloud.entity.ConfigEntry;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfigEntryRepository extends JpaRepository<ConfigEntry, Long> {

    Optional<ConfigEntry> findByKey(String key);
}
