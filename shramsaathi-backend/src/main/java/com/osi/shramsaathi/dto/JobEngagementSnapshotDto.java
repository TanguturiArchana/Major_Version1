package com.osi.shramsaathi.dto;

import java.util.List;

public record JobEngagementSnapshotDto(
        Long jobId,
        long likeCount,
        Boolean likedByCurrentWorker,
        long commentCount,
        List<EngagementCommentDto> comments
) {
}
