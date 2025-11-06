package com.osi.shramsaathi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.osi.shramsaathi.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
    Optional<User> findByPhone(String name);
}
