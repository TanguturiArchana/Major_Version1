package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.dto.AddCommentRequest;
import com.osi.shramsaathi.dto.JobEngagementCardDto;
import com.osi.shramsaathi.dto.JobEngagementSnapshotDto;
import com.osi.shramsaathi.dto.ToggleLikeRequest;
import com.osi.shramsaathi.service.EngagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/engagement")
@RequiredArgsConstructor
public class EngagementController {

    private final EngagementService engagementService;

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<JobEngagementSnapshotDto> getJobSnapshot(
            @PathVariable Long jobId,
            @RequestParam(required = false) Long workerId
    ) {
        return ResponseEntity.ok(engagementService.getJobSnapshot(jobId, workerId));
    }

    @PostMapping("/jobs/{jobId}/likes")
    public ResponseEntity<JobEngagementSnapshotDto> toggleLike(
            @PathVariable Long jobId,
            @Valid @RequestBody ToggleLikeRequest request
    ) {
        return ResponseEntity.ok(engagementService.toggleLike(jobId, request.workerId(), request.workerName()));
    }

    @PostMapping("/jobs/{jobId}/comments")
    public ResponseEntity<JobEngagementSnapshotDto> addComment(
            @PathVariable Long jobId,
            @Valid @RequestBody AddCommentRequest request
    ) {
        return ResponseEntity.ok(
                engagementService.addComment(jobId, request.workerId(), request.workerName(), request.comment())
        );
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<JobEngagementSnapshotDto> deleteComment(
            @PathVariable Long commentId,
            @RequestParam(required = false) Long workerId,
            @RequestParam(defaultValue = "false") boolean admin
    ) {
        return ResponseEntity.ok(engagementService.deleteComment(commentId, workerId, admin));
    }

    @GetMapping("/owners/{ownerId}")
    public ResponseEntity<List<JobEngagementCardDto>> getOwnerCards(@PathVariable Long ownerId) {
        return ResponseEntity.ok(engagementService.getOwnerCards(ownerId));
    }

    @GetMapping("/admin/jobs")
    public ResponseEntity<List<JobEngagementCardDto>> getAdminCards() {
        return ResponseEntity.ok(engagementService.getAdminCards());
    }
}
