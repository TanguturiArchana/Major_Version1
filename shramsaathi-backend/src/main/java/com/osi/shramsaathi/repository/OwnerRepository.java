package com.osi.shramsaathi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.model.User;

import java.util.Optional;

public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByName(String name);
    Optional<User> findByPhone(String name);
}
