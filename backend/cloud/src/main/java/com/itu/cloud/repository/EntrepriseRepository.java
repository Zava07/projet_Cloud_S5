package com.itu.cloud.repository;

import com.itu.cloud.entity.Entreprise;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {

    Optional<Entreprise> findByNom(String nom);
}
