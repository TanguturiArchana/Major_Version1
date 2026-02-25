package com.osi.shramsaathi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record SkillTestSubmitRequest(
        @NotNull Long workerId,
        @NotBlank String skill,
        @NotNull Map<Integer, Integer> answers
) {
}
