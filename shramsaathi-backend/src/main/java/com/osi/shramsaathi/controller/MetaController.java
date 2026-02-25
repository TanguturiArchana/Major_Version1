package com.osi.shramsaathi.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/meta")
public class MetaController {

    @Value("${spring.application.name:shramsaathi-backend}")
    private String appName;

    @Value("${app.version:dev}")
    private String appVersion;

    @GetMapping("/capabilities")
    public ResponseEntity<Map<String, Object>> capabilities() {
        return ResponseEntity.ok(Map.of(
                "application", appName,
                "version", appVersion,
                "timestamp", Instant.now().toString(),
                "capabilities", Map.of(
                        "otpAccountStatus", true,
                        "otpRegisterWorker", true,
                        "engagementApi", true,
                        "engagementRealtime", true
                )
        ));
    }
}
