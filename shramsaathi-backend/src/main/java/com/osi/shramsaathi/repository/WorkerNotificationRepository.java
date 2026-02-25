package com.osi.shramsaathi.repository;

import com.osi.shramsaathi.model.WorkerNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkerNotificationRepository extends JpaRepository<WorkerNotification, Long> {
    List<WorkerNotification> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
    long countByWorkerIdAndReadFlagFalse(Long workerId);
}
