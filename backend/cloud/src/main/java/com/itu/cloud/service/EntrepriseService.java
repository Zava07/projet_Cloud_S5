package com.itu.cloud.service;

import com.itu.cloud.entity.Entreprise;
import com.itu.cloud.entity.User;
import com.itu.cloud.repository.EntrepriseRepository;
import com.itu.cloud.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EntrepriseService {

    private final EntrepriseRepository entrepriseRepository;
    private final UserRepository userRepository;

    public EntrepriseService(EntrepriseRepository entrepriseRepository, UserRepository userRepository) {
        this.entrepriseRepository = entrepriseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Entreprise> findAll() {
        return entrepriseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Entreprise> findById(Long id) {
        return entrepriseRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Entreprise> findByNom(String nom) {
        return entrepriseRepository.findByNom(nom);
    }

    public Entreprise save(Entreprise entreprise) {
        return entrepriseRepository.save(entreprise);
    }

    public void deleteById(Long id) {
        entrepriseRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<User> findUsers(Long entrepriseId) {
        return userRepository.findByEntreprisesId(entrepriseId);
    }
}
