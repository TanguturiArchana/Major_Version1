package com.osi.shramsaathi.repository;

import com.osi.shramsaathi.model.WorkerSkillProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerSkillProfileRepository extends JpaRepository<WorkerSkillProfile, Long> {
    Optional<WorkerSkillProfile> findByWorkerIdAndSkillIgnoreCase(Long workerId, String skill);
    List<WorkerSkillProfile> findByWorkerId(Long workerId);
    List<WorkerSkillProfile> findBySkillIgnoreCase(String skill);
}
