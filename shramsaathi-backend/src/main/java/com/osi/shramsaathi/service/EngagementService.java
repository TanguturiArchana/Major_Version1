package com.osi.shramsaathi.service;

import com.osi.shramsaathi.dto.EngagementCommentDto;
import com.osi.shramsaathi.dto.JobEngagementCardDto;
import com.osi.shramsaathi.dto.JobEngagementSnapshotDto;
import com.osi.shramsaathi.model.Job;
import com.osi.shramsaathi.model.JobComment;
import com.osi.shramsaathi.model.JobLike;
import com.osi.shramsaathi.repository.JobCommentRepository;
import com.osi.shramsaathi.repository.JobLikeRepository;
import com.osi.shramsaathi.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EngagementService {

    private final JobRepository jobRepository;
    private final JobLikeRepository jobLikeRepository;
    private final JobCommentRepository jobCommentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public JobEngagementSnapshotDto getJobSnapshot(Long jobId, Long workerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));

        long likeCount = jobLikeRepository.countByJobId(job.getId());
        Boolean likedByCurrentWorker = workerId == null
                ? null
                : jobLikeRepository.existsByJobIdAndWorkerId(job.getId(), workerId);
        List<EngagementCommentDto> comments = jobCommentRepository.findByJobIdOrderByCreatedAtDesc(job.getId())
                .stream()
                .map(this::toCommentDto)
                .toList();

        return new JobEngagementSnapshotDto(
                job.getId(),
                likeCount,
                likedByCurrentWorker,
                comments.size(),
                comments
        );
    }

    public JobEngagementSnapshotDto toggleLike(Long jobId, Long workerId, String workerName) {
        ensureJob(jobId);
        ensureWorker(workerId);
        boolean exists = jobLikeRepository.existsByJobIdAndWorkerId(jobId, workerId);
        if (exists) {
            jobLikeRepository.deleteByJobIdAndWorkerId(jobId, workerId);
        } else {
            JobLike like = new JobLike();
            like.setJobId(jobId);
            like.setWorkerId(workerId);
            like.setWorkerName(safeName(workerName, workerId));
            jobLikeRepository.save(like);
        }
        broadcastJobSnapshot(jobId);
        return getJobSnapshot(jobId, workerId);
    }

    public JobEngagementSnapshotDto addComment(Long jobId, Long workerId, String workerName, String comment) {
        ensureJob(jobId);
        ensureWorker(workerId);
        String trimmed = comment == null ? "" : comment.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Comment cannot be empty");
        }
        if (trimmed.length() > 500) {
            throw new IllegalArgumentException("Comment exceeds 500 characters");
        }

        JobComment entity = new JobComment();
        entity.setJobId(jobId);
        entity.setWorkerId(workerId);
        entity.setWorkerName(safeName(workerName, workerId));
        entity.setComment(trimmed);
        jobCommentRepository.save(entity);

        broadcastJobSnapshot(jobId);
        return getJobSnapshot(jobId, workerId);
    }

    public JobEngagementSnapshotDto deleteComment(Long commentId, Long workerId, boolean admin) {
        JobComment comment = jobCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        if (!admin && (workerId == null || !workerId.equals(comment.getWorkerId()))) {
            throw new IllegalArgumentException("Not allowed to delete this comment");
        }

        Long jobId = comment.getJobId();
        jobCommentRepository.delete(comment);
        broadcastJobSnapshot(jobId);
        return getJobSnapshot(jobId, workerId);
    }

    public List<JobEngagementCardDto> getOwnerCards(Long ownerId) {
        List<Job> jobs = jobRepository.findByOwnerId(ownerId);
        return jobs.stream()
                .map(this::toEngagementCard)
                .sorted(Comparator
                        .comparingLong(JobEngagementCardDto::commentCount).reversed()
                        .thenComparingLong(JobEngagementCardDto::likeCount).reversed())
                .toList();
    }

    public List<JobEngagementCardDto> getAdminCards() {
        return jobRepository.findAll().stream()
                .map(this::toEngagementCard)
                .sorted(Comparator
                        .comparingLong(JobEngagementCardDto::commentCount).reversed()
                        .thenComparingLong(JobEngagementCardDto::likeCount).reversed())
                .toList();
    }

    public void broadcastJobSnapshot(Long jobId) {
        JobEngagementSnapshotDto snapshot = getJobSnapshot(jobId, null);
        messagingTemplate.convertAndSend("/topic/engagement/job/" + jobId, snapshot);
    }

    private void ensureJob(Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new IllegalArgumentException("Job not found: " + jobId);
        }
    }

    private void ensureWorker(Long workerId) {
        if (workerId == null) {
            throw new IllegalArgumentException("Worker id is required");
        }
    }

    private JobEngagementCardDto toEngagementCard(Job job) {
        long likes = jobLikeRepository.countByJobId(job.getId());
        List<JobComment> comments = jobCommentRepository.findByJobIdOrderByCreatedAtDesc(job.getId());
        long commentCount = comments.size();
        JobComment latestComment = comments.isEmpty() ? null : comments.get(0);

        return new JobEngagementCardDto(
                job.getId(),
                job.getTitle(),
                job.getOwnerId(),
                job.getOwnerName(),
                likes,
                commentCount,
                latestComment == null ? null : latestComment.getComment(),
                latestComment == null ? null : latestComment.getWorkerName(),
                latestComment == null ? null : latestComment.getCreatedAt()
        );
    }

    private EngagementCommentDto toCommentDto(JobComment comment) {
        return new EngagementCommentDto(
                comment.getId(),
                comment.getJobId(),
                comment.getWorkerId(),
                comment.getWorkerName(),
                comment.getComment(),
                comment.getCreatedAt()
        );
    }

    private String safeName(String workerName, Long workerId) {
        if (workerName == null || workerName.trim().isEmpty()) {
            return "Worker " + workerId;
        }
        return workerName.trim();
    }
}
