package com.osi.shramsaathi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.osi.shramsaathi.repository.OwnerRepository;
import com.osi.shramsaathi.repository.UserRepository;
import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.model.User;
import com.osi.shramsaathi.service.AuthService;
@CrossOrigin(origins = "http://localhost:3000") 
@RestController
@RequestMapping("/api/auth")

public class AuthController {

    @Autowired
    private AuthService authService;
     @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    // Register Worker
    @PostMapping("/register/user")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        //  Check if owner already registered as Worker
        boolean existsAsWorker = userRepository.findByName(user.getName()).isPresent() && userRepository.findByPhone(user.getPhone()).isPresent();
        boolean existsAsOwner = ownerRepository.findByName(user.getName()).isPresent() && ownerRepository.findByPhone(user.getPhone()).isPresent();
        if (existsAsOwner) {
            return ResponseEntity.badRequest()
                    .body("You are already registered as an Owner. You cannot register as a Worker again.");
        }

        if (existsAsWorker) {
            return ResponseEntity.badRequest()
                    .body("Worker already registered with this name.");
        }

        String password = authService.registerUser(user);
        return ResponseEntity.ok("Registration successful! Your generated password: " + password);
    }

    // Register Owner
    @PostMapping("/register/owner")
    public ResponseEntity<?> registerOwner(@RequestBody Owner owner) {
        // Check if owner already registered as Worker
        boolean existsAsWorker = userRepository.findByName(owner.getName()).isPresent() && userRepository.findByPhone(owner.getPhone()).isPresent();
        boolean existsAsOwner = ownerRepository.findByName(owner.getName()).isPresent() && ownerRepository.findByPhone(owner.getPhone()).isPresent();
         if (existsAsWorker) {
            return ResponseEntity.badRequest()
                    .body(" You are already registered as a Worker. You cannot register as an Owner again.");
        }

        if (existsAsOwner) {
            return ResponseEntity.badRequest()
                    .body("Owner already registered with this name.");
        }
        String password = authService.registerOwner(owner);
        return ResponseEntity.ok("Registration successful! Your generated password: " + password);
    }

    // Login for Worker
    @PostMapping("/login/user")
    public ResponseEntity<?> loginUser(@RequestParam String name, @RequestParam String password) {
        boolean success = authService.loginUser(name, password);
        return success ? ResponseEntity.ok("Login successful!") : ResponseEntity.status(401).body("Invalid credentials");
    }

    // Login for Owner
    @PostMapping("/login/owner")
    public ResponseEntity<?> loginOwner(@RequestParam String name, @RequestParam String password) {
        boolean success = authService.loginOwner(name, password);
        return success ? ResponseEntity.ok("Login successful!") : ResponseEntity.status(401).body(" Invalid credentials");
    }
     @PostMapping("/worker")
    public String workerLogin(@RequestParam String name, @RequestParam String password) {
        return userRepository.findByName(name)
                .map(user -> user.getPassword().equals(password)
                        ? "Worker login successful "
                        : "Invalid password ")
                .orElse("User not found ");
    }

    // Owner Login
    @PostMapping("/owner")
    public String ownerLogin(@RequestParam String name, @RequestParam String password) {
        return ownerRepository.findByName(name)
                .map(owner -> owner.getPassword().equals(password)
                        ? "Owner login successful "
                        : "Invalid password ")
                .orElse("Owner not found ");
    }

}
