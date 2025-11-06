package com.osi.shramsaathi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "owners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Owner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Email Address is required")
    private String address;

    @NotBlank(message = "Bussiness Name is required")
    private String businessName;
    
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
