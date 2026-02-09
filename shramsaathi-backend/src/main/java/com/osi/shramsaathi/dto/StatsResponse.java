package com.osi.shramsaathi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatsResponse {

    private long totalWorkers;
    private long totalOwners;
    private long totalJobs;
    private long activeJobs;

}
