package com.osi.shramsaathi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.osi.shramsaathi.dto.StatsResponse;
import com.osi.shramsaathi.service.StatsService;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class StatsController {

    @Autowired
    private StatsService statsService;

    @GetMapping
    public StatsResponse getStats() {
        return statsService.getStats();
    }

}