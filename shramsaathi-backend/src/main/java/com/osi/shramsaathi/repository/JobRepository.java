package com.osi.shramsaathi.repository;

import com.osi.shramsaathi.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // Custom finder methods
    List<Job> findByOwnerId(Long ownerId);

    List<Job> findBySkillNeededContainingIgnoreCase(String skillNeeded);

    List<Job> findByStatus(String status);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.decisionDeadline >= CURRENT_DATE")
    long countActiveJobs();

    List<Job> findTop3ByOrderByCreatedAtDesc();
}
