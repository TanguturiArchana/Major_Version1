package com.osi.shramsaathi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (Cross-Site Request Forgery)
            .csrf(csrf -> csrf.disable())

            // Disable CORS (Cross-Origin Resource Sharing) or configure separately in WebConfig
            .cors(cors -> cors.disable())

            // Configure request authorization
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()  // Allow all API endpoints
                .anyRequest().authenticated()            // Everything else requires auth
            );

        return http.build();
    }
}
