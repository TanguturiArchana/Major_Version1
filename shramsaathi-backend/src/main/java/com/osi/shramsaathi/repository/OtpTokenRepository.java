package com.osi.shramsaathi.repository;

import com.osi.shramsaathi.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByPhoneNumberAndUserTypeAndVerifiedFalse(String phoneNumber, String userType);
    Optional<OtpToken> findTopByPhoneNumberAndUserTypeOrderByCreatedAtDesc(String phoneNumber, String userType);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
