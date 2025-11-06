// src/main/java/com/osi/shramsaathi/controller/JobPostingController.java

package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.model.JobPosting;
import com.osi.shramsaathi.service.JobPostingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobPostingController {

    private final JobPostingService service;

    public JobPostingController(JobPostingService service) {
        this.service = service;
    }

    @PostMapping
    public JobPosting createJob(@RequestBody JobPosting job) {
        return service.addJob(job);
    }

    @GetMapping
    public List<JobPosting> getAllJobs() {
        return service.getAllJobs();
    }

  
}
