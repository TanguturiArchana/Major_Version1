package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.model.Job;
import com.osi.shramsaathi.model.JobApplication;
import com.osi.shramsaathi.model.JobPosting;
import com.osi.shramsaathi.repository.JobApplicationRepository;
import com.osi.shramsaathi.repository.JobRepository;
import com.osi.shramsaathi.repository.UserRepository;
import com.osi.shramsaathi.service.JobPostingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationRepository appRepo;
    private final JobRepository jobRepo;
    private final UserRepository userRepository;
    private final JobPostingService jobpostServ;

    public JobApplicationController(
            JobApplicationRepository appRepo,
            JobRepository jobRepo,
            UserRepository userRepository,
            JobPostingService jobpostServ
    ) {
        this.appRepo = appRepo;
        this.jobRepo = jobRepo;
        this.userRepository = userRepository;
        this.jobpostServ = jobpostServ;
    }

    @PostMapping
    public ResponseEntity<?> applyForJob(@RequestBody JobApplication application) {
        Optional<JobApplication> existing =
                appRepo.findByJobIdAndWorkerId(application.getJobId(), application.getWorkerId());

        if (existing.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "You have already applied for this job.");
            response.put("existingApplication", existing.get());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Backend fallback: derive worker details from profile if client payload is partial.
        if (application.getWorkerId() != null) {
            userRepository.findById(application.getWorkerId()).ifPresent(user -> {
                if (isBlank(application.getWorkerName())) {
                    application.setWorkerName(user.getName());
                }
                if (isBlank(application.getWorkerSkill())) {
                    application.setWorkerSkill(user.getWorkType());
                }
            });
        }

        if (isBlank(application.getWorkerName())) {
            application.setWorkerName("Worker " + application.getWorkerId());
        }
        if (isBlank(application.getWorkerSkill())) {
            application.setWorkerSkill("General");
        }

        JobApplication saved = appRepo.save(application);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Job application submitted successfully.");
        response.put("application", saved);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(appRepo.findByJobId(jobId));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<JobPosting>> getJobsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(jobpostServ.getJobsByOwner(ownerId));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Map<String, Object>>> getApplicationsByWorker(@PathVariable Long workerId) {
        List<JobApplication> apps = appRepo.findByWorkerId(workerId);
        List<Map<String, Object>> response = new ArrayList<>();

        for (JobApplication app : apps) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("workerId", app.getWorkerId());
            map.put("workerName", app.getWorkerName());
            map.put("workerSkill", app.getWorkerSkill());
            map.put("status", app.getStatus());
            map.put("appliedAt", app.getAppliedAt());
            map.put("jobId", app.getJobId());

            jobRepo.findById(app.getJobId()).ifPresentOrElse(job -> {
                map.put("jobTitle", job.getTitle());
                map.put("location", job.getLocation());
                map.put("pay", job.getPay());
                map.put("duration", job.getDuration());
            }, () -> {
                map.put("jobTitle", "Job not found");
                map.put("location", "-");
                map.put("pay", "-");
            });

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        JobApplication app = appRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Long jobId = app.getJobId();
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        LocalDate deadline = job.getDecisionDeadline();
        LocalDate today = LocalDate.now();

        if (deadline != null && today.isAfter(deadline)) {
            List<JobApplication> allApps = appRepo.findByJobId(jobId);

            for (JobApplication a : allApps) {
                if (a.getStatus().equalsIgnoreCase("PENDING")) {
                    a.setStatus("REJECTED");
                    appRepo.save(a);
                }
            }

            jobRepo.delete(job);

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Decision deadline passed. Job was automatically closed and removed.");
        }

        app.setStatus(status.toUpperCase());
        JobApplication saved = appRepo.save(app);

        return ResponseEntity.ok(saved);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
