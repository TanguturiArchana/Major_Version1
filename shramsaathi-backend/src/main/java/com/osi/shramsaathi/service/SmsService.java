package com.osi.shramsaathi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhoneNumber;

    public void sendOtp(String toPhoneNumber, String otp) {
        if (!isConfigured()) {
            log.warn("Twilio not configured. Skipping OTP SMS to {}", toPhoneNumber);
            return;
        }

        try {
            Twilio.init(accountSid, authToken);
            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(fromPhoneNumber),
                    "Your Shramsaathi OTP is: " + otp + ". Valid for 5 minutes."
            ).create();

            log.info("SMS sent successfully: {}", message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS", e);
            throw new RuntimeException("SMS sending failed", e);
        }
    }

    public void sendWelcomeMessage(String toPhoneNumber, String userName) {
        if (!isConfigured()) {
            log.warn("Twilio not configured. Skipping welcome SMS to {}", toPhoneNumber);
            return;
        }

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

    private boolean isConfigured() {
        return StringUtils.hasText(accountSid)
                && StringUtils.hasText(authToken)
                && StringUtils.hasText(fromPhoneNumber);
    }
}