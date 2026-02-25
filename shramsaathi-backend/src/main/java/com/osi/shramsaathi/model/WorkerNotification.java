package com.osi.shramsaathi.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "worker_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long workerId;
    private Long jobId;

    private String type; // SKILL_MATCH, GENERAL
    private String title;

    @Column(length = 1000)
    private String message;

    @Builder.Default
    private Boolean readFlag = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
