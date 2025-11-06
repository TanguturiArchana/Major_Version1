package com.osi.shramsaathi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Work type is required")
    private String workType; // e.g., electrician, plumber

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Mandal is required")
    private String mandal;

    @NotNull(message = "Pincode is required")
    private Integer pincode;

    //  Use @Builder.Default so Lombok keeps the default value when using .builder()
    @Builder.Default
    private Boolean registered = true;
        // Hashed password stored here
    @Column(nullable = false)
    private String password;


    
}
