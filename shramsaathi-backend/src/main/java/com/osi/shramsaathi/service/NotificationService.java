package com.osi.shramsaathi.service;

import com.osi.shramsaathi.model.Job;
import com.osi.shramsaathi.model.User;
import com.osi.shramsaathi.model.WorkerNotification;
import com.osi.shramsaathi.model.WorkerSkillProfile;
import com.osi.shramsaathi.repository.UserRepository;
import com.osi.shramsaathi.repository.WorkerNotificationRepository;
import com.osi.shramsaathi.repository.WorkerSkillProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;
    private final WorkerSkillProfileRepository workerSkillProfileRepository;
    private final WorkerNotificationRepository workerNotificationRepository;

    public void notifySkillMatchedWorkers(Job job) {
        String requiredSkill = normalize(job.getSkillNeeded());
        List<User> workers = userRepository.findAll();

        for (User worker : workers) {
            if (!isSkillMatched(worker, requiredSkill)) {
                continue;
            }

            WorkerNotification notification = WorkerNotification.builder()
                    .workerId(worker.getId())
                    .jobId(job.getId())
                    .type("SKILL_MATCH")
                    .title("New matching job available")
                    .message("A new '" + job.getTitle() + "' job matches your skill: " + job.getSkillNeeded())
                    .build();
            workerNotificationRepository.save(notification);
        }
    }

    public List<WorkerNotification> getWorkerNotifications(Long workerId) {
        return workerNotificationRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
    }

    public long getUnreadCount(Long workerId) {
        return workerNotificationRepository.countByWorkerIdAndReadFlagFalse(workerId);
    }

    public WorkerNotification markAsRead(Long notificationId) {
        WorkerNotification notification = workerNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setReadFlag(true);
        return workerNotificationRepository.save(notification);
    }

    private boolean isSkillMatched(User worker, String requiredSkill) {
        String workerSkill = normalize(worker.getWorkType());
        if (workerSkill.contains(requiredSkill) || requiredSkill.contains(workerSkill)) {
            return true;
        }

        WorkerSkillProfile profile = workerSkillProfileRepository
                .findByWorkerIdAndSkillIgnoreCase(worker.getId(), requiredSkill)
                .orElse(null);
        return profile != null && profile.getScore() != null && profile.getScore() >= 60;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
