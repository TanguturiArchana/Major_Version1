package com.osi.shramsaathi.dto;

import java.time.LocalDateTime;

public record EngagementCommentDto(
        Long id,
        Long jobId,
        Long workerId,
        String workerName,
        String comment,
        LocalDateTime createdAt
) {
}
