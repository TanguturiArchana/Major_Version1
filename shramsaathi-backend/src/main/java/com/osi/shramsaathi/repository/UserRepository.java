package com.osi.shramsaathi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.osi.shramsaathi.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByName(String name);
    Optional<User> findByPhone(String name);
    Optional<User> findByNameAndPhone(String name, String phone);
    Optional<User> findByNameAndPassword(String name, String password);
    List<User> findAllByName(String name);
    Optional<User> findById(Long id);
}
