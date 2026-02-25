package com.osi.shramsaathi.dto;

import java.time.LocalDateTime;

public record JobEngagementCardDto(
        Long jobId,
        String jobTitle,
        Long ownerId,
        String ownerName,
        long likeCount,
        long commentCount,
        String latestCommentPreview,
        String latestCommentBy,
        LocalDateTime latestCommentAt
) {
}
