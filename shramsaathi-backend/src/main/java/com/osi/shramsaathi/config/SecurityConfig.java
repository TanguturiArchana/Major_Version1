package com.osi.shramsaathi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import com.osi.shramsaathi.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/api/auth/**",
                    "/api/meta/**",
                    "/api/stats",
                    "/api/jobs/**",
                    "/api/users/**",
                    "/api/owners/**",
                    "/api/applications/**",
                    "/api/skill-tests/**",
                    "/api/jobs/recent",
                    "/api/engagement/**",
                    "/ws/**",
                    "/error",
                    "/favicon.ico"
                ).permitAll()
                .requestMatchers(
                    "/api/chat/**",
                    "/api/notifications/**"
                ).authenticated()
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(formLogin -> formLogin.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
