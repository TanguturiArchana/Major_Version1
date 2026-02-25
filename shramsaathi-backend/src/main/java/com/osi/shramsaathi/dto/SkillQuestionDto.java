package com.osi.shramsaathi.dto;

import java.util.List;

public record SkillQuestionDto(
        Integer id,
        String question,
        List<String> options
) {
}
