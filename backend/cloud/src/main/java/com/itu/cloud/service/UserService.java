package com.itu.cloud.service;

import com.itu.cloud.entity.Entreprise;
import com.itu.cloud.entity.User;
import com.itu.cloud.repository.EntrepriseRepository;
import com.itu.cloud.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final EntrepriseRepository entrepriseRepository;

    public UserService(UserRepository userRepository, EntrepriseRepository entrepriseRepository) {
        this.userRepository = userRepository;
        this.entrepriseRepository = entrepriseRepository;
    }

    @Value("${app.maxFailedLogins:3}")
    private int maxFailedLogins;

    /**
     * Increment login attempts and block the user if threshold reached. Returns the saved user.
     */
    public User registerFailedLoginAttempt(User user) {
        Integer attempts = user.getLoginAttempts();
        attempts = (attempts == null) ? 1 : attempts + 1;
        user.setLoginAttempts(attempts);
        if (attempts >= maxFailedLogins) {
            user.setBlocked(Boolean.TRUE);
        }
        return userRepository.save(user);
    }

    /**
     * Reset failed login attempts and unblock the user.
     */
    public User resetFailedLoginAttempts(User user) {
        user.setLoginAttempts(0);
        user.setBlocked(Boolean.FALSE);
        return userRepository.save(user);
    }

    /**
     * Admin action to unblock a user by id.
     */
    public User unblockUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setLoginAttempts(0);
        user.setBlocked(Boolean.FALSE);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<User> findAllWithRelations(boolean includeEntreprises, boolean includeReports) {
        if (includeEntreprises || includeReports) {
            return userRepository.findAllWithRelations();
        }
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByIdWithRelations(Long id, boolean includeEntreprises, boolean includeReports) {
        if (includeEntreprises || includeReports) {
            return userRepository.findByIdWithRelations(id);
        }
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<User> findByEntrepriseId(Long entrepriseId) {
        return userRepository.findByEntreprisesId(entrepriseId);
    }

    public void addEntrepriseToUser(Long userId, Long entrepriseId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Entreprise ent = entrepriseRepository.findById(entrepriseId).orElseThrow(() -> new IllegalArgumentException("Entreprise not found"));
        if (!user.getEntreprises().contains(ent)) {
            user.getEntreprises().add(ent);
            userRepository.save(user);
        }
    }

    public void removeEntrepriseFromUser(Long userId, Long entrepriseId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.getEntreprises().removeIf(e -> e.getId().equals(entrepriseId));
        userRepository.save(user);
    }
}
