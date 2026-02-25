package com.osi.shramsaathi.dto;

public record SkillTestResultDto(
        Long workerId,
        String skill,
        Integer score,
        Integer totalQuestions,
        String level
) {
}
