package com.osi.shramsaathi.service;

import com.osi.shramsaathi.dto.SkillQuestionDto;
import com.osi.shramsaathi.dto.SkillTestResultDto;
import com.osi.shramsaathi.model.WorkerSkillProfile;
import com.osi.shramsaathi.repository.WorkerSkillProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SkillTestService {

    private final WorkerSkillProfileRepository workerSkillProfileRepository;

    private static final Map<String, List<Question>> QUESTION_BANK = buildQuestionBank();

    public List<SkillQuestionDto> getQuestions(String skill) {
        String key = normalize(skill);
        List<Question> questions = QUESTION_BANK.getOrDefault(key, QUESTION_BANK.get("general"));
        return questions.stream()
                .map(q -> new SkillQuestionDto(q.id(), q.question(), q.options()))
                .toList();
    }

    public SkillTestResultDto submit(Long workerId, String skill, Map<Integer, Integer> answers) {
        String key = normalize(skill);
        List<Question> questions = QUESTION_BANK.getOrDefault(key, QUESTION_BANK.get("general"));

        int correct = 0;
        for (Question q : questions) {
            Integer selected = answers.get(q.id());
            if (selected != null && selected == q.correctIndex()) {
                correct++;
            }
        }

        int total = questions.size();
        int score = (int) Math.round((correct * 100.0) / Math.max(total, 1));
        String level = deriveLevel(score);

        WorkerSkillProfile profile = workerSkillProfileRepository
                .findByWorkerIdAndSkillIgnoreCase(workerId, key)
                .orElse(WorkerSkillProfile.builder()
                        .workerId(workerId)
                        .skill(key)
                        .testsTaken(0)
                        .build());

        profile.setScore(score);
        profile.setLevel(level);
        profile.setTestsTaken((profile.getTestsTaken() == null ? 0 : profile.getTestsTaken()) + 1);
        profile.setLastUpdated(LocalDateTime.now());
        workerSkillProfileRepository.save(profile);

        return new SkillTestResultDto(workerId, key, score, total, level);
    }

    public List<WorkerSkillProfile> getWorkerSkillProfiles(Long workerId) {
        return workerSkillProfileRepository.findByWorkerId(workerId);
    }

    public Optional<WorkerSkillProfile> getWorkerSkillProfile(Long workerId, String skill) {
        return workerSkillProfileRepository.findByWorkerIdAndSkillIgnoreCase(workerId, normalize(skill));
    }

    private String deriveLevel(int score) {
        if (score >= 80) return "Pro";
        if (score >= 60) return "Verified";
        return "Beginner";
    }

    private String normalize(String skill) {
        return skill == null ? "general" : skill.trim().toLowerCase();
    }

    private static Map<String, List<Question>> buildQuestionBank() {
        Map<String, List<Question>> bank = new HashMap<>();
        bank.put("carpentry", List.of(
                q(1, "Best tool for smooth finishing?", List.of("Chisel", "Sandpaper", "Hammer", "Level"), 1),
                q(2, "What is plumb in woodworking?", List.of("Horizontal line", "Vertical alignment", "Joint type", "Wood grade"), 1),
                q(3, "Primary safety gear?", List.of("Gloves only", "No gear", "Goggles + gloves", "Cap"), 2)
        ));
        bank.put("building", List.of(
                q(1, "Curing should be done for?", List.of("1 day", "3 days", "7+ days", "No curing"), 2),
                q(2, "Good brickwork joint thickness?", List.of("2-3 mm", "10 mm", "25 mm", "40 mm"), 1),
                q(3, "Before working at height, check?", List.of("Shoes only", "Scaffolding stability", "Paint color", "Sunlight"), 1)
        ));
        bank.put("general", List.of(
                q(1, "Customer trust improves with?", List.of("Late delivery", "Clear communication", "Ignoring safety", "No estimate"), 1),
                q(2, "Best way to avoid rework?", List.of("Skip inspection", "Confirm requirement", "Rush execution", "Ignore tolerance"), 1),
                q(3, "Worksite safety priority?", List.of("Optional", "Only for big jobs", "Always mandatory", "Avoid helmet"), 2)
        ));
        return bank;
    }

    private static Question q(int id, String question, List<String> options, int correctIndex) {
        return new Question(id, question, options, correctIndex);
    }

    private record Question(Integer id, String question, List<String> options, Integer correctIndex) {
    }
}
