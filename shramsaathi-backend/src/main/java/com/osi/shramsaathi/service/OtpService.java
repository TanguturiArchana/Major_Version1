package com.osi.shramsaathi.service;

import com.osi.shramsaathi.model.OtpToken;
import com.osi.shramsaathi.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpTokenRepository otpRepository;
    private final SmsService smsService;

    @Value("${otp.expiry.minutes:5}")
    private int otpExpiryMinutes;

    @Value("${otp.mock-mode:true}")
    private boolean otpMockMode;

    /**
     * Generate and send OTP to phone number
     */
    public String generateAndSendOtp(String phoneNumber, String userType) {
        // Invalidate previous OTPs
        otpRepository.findByPhoneNumberAndUserTypeAndVerifiedFalse(phoneNumber, userType)
                .ifPresent(existingOtp -> {
                    existingOtp.setVerified(true);
                    otpRepository.save(existingOtp);
                });

        // Generate new OTP
        String otp = generateOtp();
        OtpToken otpToken = OtpToken.builder()
                .phoneNumber(phoneNumber)
                .otp(otp)
                .userType(userType)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .verified(false)
                .attempts(0)
                .build();

        otpRepository.save(otpToken);

        // Send OTP via SMS
        try {
            smsService.sendOtp(phoneNumber, otp);
            return "OTP sent to " + phoneNumber;
        } catch (Exception e) {
            log.error("Failed to send SMS for OTP delivery", e);
            if (otpMockMode) {
                log.warn("OTP mock mode active. Returning OTP in response for phone {}", phoneNumber);
                return "SMS delivery failed. Use OTP: " + otp;
            }
            throw new RuntimeException("Failed to send OTP SMS");
        }
    }

    /**
     * Verify OTP
     */
    public boolean verifyOtp(String phoneNumber, String userType, String otp) {
        OtpToken otpToken = otpRepository.findByPhoneNumberAndUserTypeAndVerifiedFalse(phoneNumber, userType)
                .orElse(null);

        if (otpToken == null) {
            return false;
        }

        if (!otpToken.isValid()) {
            return false;
        }

        otpToken.setAttempts(otpToken.getAttempts() + 1);

        if (!otpToken.getOtp().equals(otp)) {
            otpRepository.save(otpToken);
            return false;
        }

        otpToken.setVerified(true);
        otpRepository.save(otpToken);
        return true;
    }

    /**
     * Check if OTP is verified
     */
    public boolean isOtpVerified(String phoneNumber, String userType) {
        OtpToken otpToken = otpRepository.findTopByPhoneNumberAndUserTypeOrderByCreatedAtDesc(phoneNumber, userType)
                .orElse(null);
        return otpToken != null
                && Boolean.TRUE.equals(otpToken.getVerified())
                && !otpToken.isExpired();
    }

    /**
     * Generate random 6-digit OTP
     */
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Clean up expired OTPs
     */
    public void cleanupExpiredOtps() {
        otpRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
