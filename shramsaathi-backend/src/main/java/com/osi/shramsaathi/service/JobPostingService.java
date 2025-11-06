// src/main/java/com/osi/shramsaathi/service/JobPostingService.java

package com.osi.shramsaathi.service;

import com.osi.shramsaathi.model.JobPosting;
import com.osi.shramsaathi.repository.JobPostingRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JobPostingService {

    private final JobPostingRepository repository;

    public JobPostingService(JobPostingRepository repository) {
        this.repository = repository;
    }

    public JobPosting addJob(JobPosting job) {
        return repository.save(job);
    }

    public List<JobPosting> getAllJobs() {
        return repository.findAll();
    }

   
}
