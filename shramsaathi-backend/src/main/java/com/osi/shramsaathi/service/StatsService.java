
package com.osi.shramsaathi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.osi.shramsaathi.dto.StatsResponse;
import com.osi.shramsaathi.repository.JobRepository;
import com.osi.shramsaathi.repository.OwnerRepository;
import com.osi.shramsaathi.repository.UserRepository;

@Service
public class StatsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private JobRepository jobRepository;

    public StatsResponse getStats() {

        long totalWorkers = userRepository.count();
        long totalOwners = ownerRepository.count();
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countActiveJobs();

        return new StatsResponse(
                totalWorkers,
                totalOwners,
                totalJobs,
                activeJobs
        );
    }
}
