package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.dto.UserRequest;
import com.osi.shramsaathi.dto.UserResponse;
import com.osi.shramsaathi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** Register a new user */
    @PostMapping
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    /** Get all users */
    @GetMapping
    public ResponseEntity<List<UserResponse>> all() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

}
