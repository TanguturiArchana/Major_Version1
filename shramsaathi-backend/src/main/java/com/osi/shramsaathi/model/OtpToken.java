package com.osi.shramsaathi.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phoneNumber;
    private String otp;
    private String userType; // "WORKER" or "OWNER"
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean verified = false;
    private Integer attempts = 0;
    private static final int MAX_ATTEMPTS = 3;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !verified && !isExpired() && attempts < MAX_ATTEMPTS;
    }
}
