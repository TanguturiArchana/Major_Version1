package com.osi.shramsaathi.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "worker_skill_profiles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"workerId", "skill"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerSkillProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long workerId;

    private String skill;

    private Integer score;

    private String level; // Beginner / Verified / Pro

    @Builder.Default
    private Integer testsTaken = 0;

    private LocalDateTime lastUpdated;
}
