package com.osi.shramsaathi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.osi.shramsaathi.model.Owner;


import java.util.Optional;
import java.util.List;

public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByName(String name);
    Optional<Owner> findByPhone(String name);
    Optional<Owner> findByNameAndPhone(String name, String phone);
    Optional<Owner> findByNameAndPassword(String name, String password);
    List<Owner> findAllByName(String name);


    Optional<Owner> findById(Long id);
}
