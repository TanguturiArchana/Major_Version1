package com.osi.shramsaathi.repository;

import com.osi.shramsaathi.model.JobLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobLikeRepository extends JpaRepository<JobLike, Long> {
    long countByJobId(Long jobId);
    boolean existsByJobIdAndWorkerId(Long jobId, Long workerId);
    void deleteByJobIdAndWorkerId(Long jobId, Long workerId);
}
