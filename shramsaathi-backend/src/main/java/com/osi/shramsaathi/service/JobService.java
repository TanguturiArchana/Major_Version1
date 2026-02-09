package com.osi.shramsaathi.service;

import com.osi.shramsaathi.dto.JobRequest;
import com.osi.shramsaathi.dto.JobResponse;
import java.util.List;
import com.osi.shramsaathi.model.Job;

public interface JobService {
    JobResponse createJob(JobRequest request);
    JobResponse updateJob(Long id, JobRequest request);
    void deleteJob(Long id);
    JobResponse getJobById(Long id);
    List<JobResponse> getJobsByOwner(Long ownerId);
    List<JobResponse> searchBySkill(String skill);
    
    List<JobResponse> getAllJobs();
     List<JobResponse> getRecentJobs();
}
