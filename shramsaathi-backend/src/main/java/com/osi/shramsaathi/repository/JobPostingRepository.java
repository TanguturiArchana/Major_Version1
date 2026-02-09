

package com.osi.shramsaathi.repository;

import com.osi.shramsaathi.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByOwnerId(Long ownerId);
    
}
