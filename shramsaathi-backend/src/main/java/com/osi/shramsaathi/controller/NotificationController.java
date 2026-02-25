package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.model.WorkerNotification;
import com.osi.shramsaathi.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<?> getWorkerNotifications(@PathVariable Long workerId) {
        return ResponseEntity.ok(Map.of(
                "unreadCount", notificationService.getUnreadCount(workerId),
                "items", notificationService.getWorkerNotifications(workerId)
        ));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<WorkerNotification> markAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }
}
