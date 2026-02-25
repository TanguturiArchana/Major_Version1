package com.osi.shramsaathi.dto;

import jakarta.validation.constraints.NotNull;

public record ToggleLikeRequest(
        @NotNull Long workerId,
        String workerName
) {
}
