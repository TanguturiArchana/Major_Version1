package com.osi.shramsaathi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddCommentRequest(
        @NotNull Long workerId,
        String workerName,
        @NotBlank String comment
) {
}
