package com.itu.cloud.repository;

import com.itu.cloud.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByFirebaseUid(String firebaseUid);

    List<User> findByEntreprisesId(Long entrepriseId);

    @Query("select distinct u from User u left join fetch u.entreprises left join fetch u.reports")
    List<User> findAllWithRelations();

    @Query("select u from User u left join fetch u.entreprises left join fetch u.reports where u.id = :id")
    Optional<User> findByIdWithRelations(@Param("id") Long id);
}
