package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.dto.SkillQuestionDto;
import com.osi.shramsaathi.dto.SkillTestResultDto;
import com.osi.shramsaathi.dto.SkillTestSubmitRequest;
import com.osi.shramsaathi.model.WorkerSkillProfile;
import com.osi.shramsaathi.service.SkillTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-tests")
@RequiredArgsConstructor
public class SkillTestController {

    private final SkillTestService skillTestService;

    @GetMapping("/questions")
    public ResponseEntity<List<SkillQuestionDto>> getQuestions(@RequestParam String skill) {
        return ResponseEntity.ok(skillTestService.getQuestions(skill));
    }

    @PostMapping("/submit")
    public ResponseEntity<SkillTestResultDto> submit(@Valid @RequestBody SkillTestSubmitRequest request) {
        return ResponseEntity.ok(skillTestService.submit(request.workerId(), request.skill(), request.answers()));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkerSkillProfile>> getWorkerProfiles(@PathVariable Long workerId) {
        return ResponseEntity.ok(skillTestService.getWorkerSkillProfiles(workerId));
    }

    @GetMapping("/worker/{workerId}/{skill}")
    public ResponseEntity<?> getWorkerProfileBySkill(@PathVariable Long workerId, @PathVariable String skill) {
        return ResponseEntity.ok(
                skillTestService.getWorkerSkillProfile(workerId, skill).orElse(null)
        );
    }
}
