package com.osi.shramsaathi.repository;

import com.osi.shramsaathi.model.JobComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobCommentRepository extends JpaRepository<JobComment, Long> {
    List<JobComment> findByJobIdOrderByCreatedAtDesc(Long jobId);
    long countByJobId(Long jobId);
}
