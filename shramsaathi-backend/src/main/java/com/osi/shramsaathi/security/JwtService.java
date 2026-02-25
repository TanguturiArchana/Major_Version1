package com.osi.shramsaathi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiry-seconds:900}")
    private long accessTokenExpirySeconds;

    @Value("${jwt.refresh-token-expiry-seconds:2592000}")
    private long refreshTokenExpirySeconds;

    public String generateAccessToken(Long userId, String role, String subject) {
        return generateToken(userId, role, subject, "access", accessTokenExpirySeconds);
    }

    public String generateRefreshToken(Long userId, String role, String subject) {
        return generateToken(userId, role, subject, "refresh", refreshTokenExpirySeconds);
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(String.valueOf(parseToken(token).get("tokenType")));
    }

    private String generateToken(Long userId, String role, String subject, String tokenType, long ttlSeconds) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(ttlSeconds);

        return Jwts.builder()
                .claims(Map.of(
                        "uid", userId,
                        "role", role,
                        "tokenType", tokenType
                ))
                .subject(subject)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
