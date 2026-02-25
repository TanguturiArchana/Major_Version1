package com.osi.shramsaathi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.osi.shramsaathi.repository.OwnerRepository;
import com.osi.shramsaathi.repository.UserRepository;
import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.model.User;
import com.osi.shramsaathi.service.AuthService;
import com.osi.shramsaathi.service.OtpService;
import com.osi.shramsaathi.service.SmsService;
import com.osi.shramsaathi.security.JwtService;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private JwtService jwtService;

    // ==================== OTP-Based Registration ====================

    @GetMapping("/account-status")
    public ResponseEntity<?> getAccountStatus(
            @RequestParam String phoneNumber,
            @RequestParam String role
    ) {
        String normalizedRole = role == null ? "" : role.trim().toUpperCase();
        boolean registered;
        boolean existsInOtherRole;

        if ("WORKER".equals(normalizedRole)) {
            registered = userRepository.findByPhone(phoneNumber).isPresent();
            existsInOtherRole = ownerRepository.findByPhone(phoneNumber).isPresent();
        } else if ("OWNER".equals(normalizedRole)) {
            registered = ownerRepository.findByPhone(phoneNumber).isPresent();
            existsInOtherRole = userRepository.findByPhone(phoneNumber).isPresent();
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid role. Use WORKER or OWNER."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "role", normalizedRole,
                "registered", registered,
                "existsInOtherRole", existsInOtherRole
        ));
    }

    /**
     * Step 1: Send OTP to phone number for Worker registration
     */
    @RequestMapping(value = "/register/worker/send-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> sendOtpForWorkerRegistration(@RequestParam String phoneNumber) {
        // Check if already registered
        if (userRepository.findByPhone(phoneNumber).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered as Worker");
        }
        if (ownerRepository.findByPhone(phoneNumber).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered as Owner");
        }

        String result = otpService.generateAndSendOtp(phoneNumber, "WORKER");
        return ResponseEntity.ok(result);
    }

    /**
     * Step 2: Verify OTP for Worker registration
     */
    @RequestMapping(value = "/register/worker/verify-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> verifyOtpForWorkerRegistration(
            @RequestParam String phoneNumber,
            @RequestParam String otp) {
        boolean isVerified = otpService.verifyOtp(phoneNumber, "WORKER", otp);
        if (!isVerified) {
            return ResponseEntity.status(401).body("Invalid or expired OTP");
        }
        return ResponseEntity.ok("OTP verified successfully");
    }

    /**
     * Step 3: Complete Worker registration with OTP verification
     */
    @PostMapping("/register/worker/complete")
    public ResponseEntity<?> completeWorkerRegistration(@RequestBody User user) {
        // Verify OTP was confirmed
        boolean isOtpVerified = otpService.isOtpVerified(user.getPhone(), "WORKER");
        if (!isOtpVerified) {
            return ResponseEntity.status(401).body("OTP verification required before registration");
        }

        // Check if already registered
        if (userRepository.findByPhone(user.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered");
        }

        String password = authService.registerUser(user);
        User saved = userRepository.findByPhone(user.getPhone()).orElse(null);
        smsService.sendWelcomeMessage(user.getPhone(), user.getName());
        Long userId = saved != null ? saved.getId() : -1L;
        String accessToken = jwtService.generateAccessToken(userId, "WORKER", user.getPhone());
        String refreshToken = jwtService.generateRefreshToken(userId, "WORKER", user.getPhone());
        return ResponseEntity.ok(buildAuthResponse("Registration successful", userId, "WORKER", accessToken, refreshToken, password));
    }

    /**
     * Step 1: Send OTP to phone number for Owner registration
     */
    @RequestMapping(value = "/register/owner/send-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> sendOtpForOwnerRegistration(@RequestParam String phoneNumber) {
        // Check if already registered
        if (ownerRepository.findByPhone(phoneNumber).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered as Owner");
        }
        if (userRepository.findByPhone(phoneNumber).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered as Worker");
        }

        String result = otpService.generateAndSendOtp(phoneNumber, "OWNER");
        return ResponseEntity.ok(result);
    }

    /**
     * Step 2: Verify OTP for Owner registration
     */
    @RequestMapping(value = "/register/owner/verify-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> verifyOtpForOwnerRegistration(
            @RequestParam String phoneNumber,
            @RequestParam String otp) {
        boolean isVerified = otpService.verifyOtp(phoneNumber, "OWNER", otp);
        if (!isVerified) {
            return ResponseEntity.status(401).body("Invalid or expired OTP");
        }
        return ResponseEntity.ok("OTP verified successfully");
    }

    /**
     * Step 3: Complete Owner registration with OTP verification
     */
    @PostMapping("/register/owner/complete")
    public ResponseEntity<?> completeOwnerRegistration(@RequestBody Owner owner) {
        // Verify OTP was confirmed
        boolean isOtpVerified = otpService.isOtpVerified(owner.getPhone(), "OWNER");
        if (!isOtpVerified) {
            return ResponseEntity.status(401).body("OTP verification required before registration");
        }

        // Check if already registered
        if (ownerRepository.findByPhone(owner.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered");
        }

        String password = authService.registerOwner(owner);
        Owner saved = ownerRepository.findByPhone(owner.getPhone()).orElse(null);
        smsService.sendWelcomeMessage(owner.getPhone(), owner.getName());
        Long ownerId = saved != null ? saved.getId() : -1L;
        String accessToken = jwtService.generateAccessToken(ownerId, "OWNER", owner.getPhone());
        String refreshToken = jwtService.generateRefreshToken(ownerId, "OWNER", owner.getPhone());
        return ResponseEntity.ok(buildAuthResponse("Registration successful", ownerId, "OWNER", accessToken, refreshToken, password));
    }

    // ==================== OTP-Based Login ====================

    /**
     * Step 1: Send OTP for Worker login
     */
    @RequestMapping(value = "/login/worker/send-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> sendOtpForWorkerLogin(@RequestParam String phoneNumber) {
        if (!userRepository.findByPhone(phoneNumber).isPresent()) {
            return ResponseEntity.status(404).body("Worker not found");
        }
        String result = otpService.generateAndSendOtp(phoneNumber, "WORKER");
        return ResponseEntity.ok(result);
    }

    /**
     * Step 2: Verify OTP for Worker login
     */
    @RequestMapping(value = "/login/worker/verify-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> verifyOtpForWorkerLogin(
            @RequestParam String phoneNumber,
            @RequestParam String otp) {
        User user = userRepository.findByPhone(phoneNumber).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("Worker not found");
        }

        boolean isVerified = otpService.verifyOtp(phoneNumber, "WORKER", otp);
        if (!isVerified) {
            return ResponseEntity.status(401).body("Invalid or expired OTP");
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), "WORKER", user.getPhone());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), "WORKER", user.getPhone());
        return ResponseEntity.ok(buildAuthResponse("Login successful", user.getId(), "WORKER", accessToken, refreshToken, null));
    }

    /**
     * Step 1: Send OTP for Owner login
     */
    @RequestMapping(value = "/login/owner/send-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> sendOtpForOwnerLogin(@RequestParam String phoneNumber) {
        if (!ownerRepository.findByPhone(phoneNumber).isPresent()) {
            return ResponseEntity.status(404).body("Owner not found");
        }
        String result = otpService.generateAndSendOtp(phoneNumber, "OWNER");
        return ResponseEntity.ok(result);
    }

    /**
     * Step 2: Verify OTP for Owner login
     */
    @RequestMapping(value = "/login/owner/verify-otp", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<?> verifyOtpForOwnerLogin(
            @RequestParam String phoneNumber,
            @RequestParam String otp) {
        Owner owner = ownerRepository.findByPhone(phoneNumber).orElse(null);
        if (owner == null) {
            return ResponseEntity.status(404).body("Owner not found");
        }

        boolean isVerified = otpService.verifyOtp(phoneNumber, "OWNER", otp);
        if (!isVerified) {
            return ResponseEntity.status(401).body("Invalid or expired OTP");
        }

        String accessToken = jwtService.generateAccessToken(owner.getId(), "OWNER", owner.getPhone());
        String refreshToken = jwtService.generateRefreshToken(owner.getId(), "OWNER", owner.getPhone());
        return ResponseEntity.ok(buildAuthResponse("Login successful", owner.getId(), "OWNER", accessToken, refreshToken, null));
    }

    // ==================== Legacy Password-Based Auth (Optional) ====================

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
        User user = userRepository.findByName(name).orElse(null);
        if (user == null) return ResponseEntity.status(401).body("Invalid credentials");
        boolean success = authService.loginUser(name, password);
        if (!success) return ResponseEntity.status(401).body("Invalid credentials");
        String accessToken = jwtService.generateAccessToken(user.getId(), "WORKER", user.getPhone());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), "WORKER", user.getPhone());
        return ResponseEntity.ok(buildAuthResponse("Login successful", user.getId(), "WORKER", accessToken, refreshToken, null));
    }

    // Login for Owner
    @PostMapping("/login/owner")
    public ResponseEntity<?> loginOwner(@RequestParam String name, @RequestParam String password) {
        Owner owner = ownerRepository.findByName(name).orElse(null);
        if (owner == null) return ResponseEntity.status(401).body("Invalid credentials");
        boolean success = authService.loginOwner(name, password);
        if (!success) return ResponseEntity.status(401).body("Invalid credentials");
        String accessToken = jwtService.generateAccessToken(owner.getId(), "OWNER", owner.getPhone());
        String refreshToken = jwtService.generateRefreshToken(owner.getId(), "OWNER", owner.getPhone());
        return ResponseEntity.ok(buildAuthResponse("Login successful", owner.getId(), "OWNER", accessToken, refreshToken, null));
    }

    @PostMapping("/token/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body("refreshToken is required");
        }
        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                return ResponseEntity.status(401).body("Invalid refresh token");
            }
            var claims = jwtService.parseToken(refreshToken);
            Long userId = Long.valueOf(String.valueOf(claims.get("uid")));
            String role = String.valueOf(claims.get("role"));
            String subject = claims.getSubject();
            String newAccessToken = jwtService.generateAccessToken(userId, role, subject);
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Expired or invalid refresh token");
        }
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

    private Map<String, Object> buildAuthResponse(
            String message,
            Long id,
            String role,
            String accessToken,
            String refreshToken,
            String generatedPassword
    ) {
        if (generatedPassword == null) {
            return Map.of(
                    "message", message,
                    "id", id,
                    "role", role,
                    "accessToken", accessToken,
                    "refreshToken", refreshToken
            );
        }
        return Map.of(
                "message", message,
                "id", id,
                "role", role,
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "generatedPassword", generatedPassword
        );
    }

}
