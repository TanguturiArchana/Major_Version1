package com.osi.shramsaathi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromPhoneNumber;

    /**
     * Send OTP via SMS using Twilio
     */
    public void sendOtp(String toPhoneNumber, String otp) {
        try {
            // Initialize Twilio
            Twilio.init(accountSid, authToken);

            // Send message
            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),      // To number
                    new PhoneNumber(fromPhoneNumber),    // From number
                    "Your Shramsaathi OTP is: " + otp + ". Valid for 5 minutes."
            ).create();

            log.info("SMS sent successfully: {}", message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS", e);
            throw new RuntimeException("SMS sending failed", e);
        }
    }

    /**
     * Send welcome message
     */
    public void sendWelcomeMessage(String toPhoneNumber, String userName) {
        try {
            Twilio.init(accountSid, authToken);

            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(fromPhoneNumber),
                    "Welcome to Shramsaathi, " + userName + "! Your registration is complete."
            ).create();

            log.info("Welcome SMS sent: {}", message.getSid());
        } catch (Exception e) {
            log.error("Failed to send welcome SMS", e);
        }
    }
}
