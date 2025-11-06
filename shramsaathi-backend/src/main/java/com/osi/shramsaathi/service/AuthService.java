package com.osi.shramsaathi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.model.User;
import com.osi.shramsaathi.repository.OwnerRepository;
import com.osi.shramsaathi.repository.UserRepository;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Register Worker (User)
    public String registerUser(User user) {
        String randomPassword = PasswordGenerator.generate();
        String encodedPassword = passwordEncoder.encode(randomPassword);

        userRepository.save(
                User.builder()
                        .name(user.getName())
                        .phone(user.getPhone())
                        .address(user.getAddress())
                        .workType(user.getWorkType())
                        .district(user.getDistrict())
                        .mandal(user.getMandal())
                        .pincode(user.getPincode())
                        .password(encodedPassword) 
                        .registered(true)
                        .build()
        );

        return randomPassword;
    }

    // Register Owner
    public String registerOwner(Owner owner) {
        String randomPassword = PasswordGenerator.generate();
        String encodedPassword = passwordEncoder.encode(randomPassword);

        ownerRepository.save(
                Owner.builder()
                        .name(owner.getName())
                        .phone(owner.getPhone())
                        .address(owner.getAddress())
                        .businessName(owner.getBusinessName())
                        .district(owner.getDistrict())
                        .mandal(owner.getMandal())
                        .pincode(owner.getPincode())
                        .password(encodedPassword)  
                        .registered(true)
                        .build()
        );

        return randomPassword;
    }

    // Worker Login
    public boolean loginUser(String name, String password) {
        Optional<User> userOpt = userRepository.findByName(name);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        return passwordEncoder.matches(password, user.getPassword());
    }

    // Owner Login
    public boolean loginOwner(String name, String password) {
        Optional<Owner> ownerOpt = ownerRepository.findByName(name);
        if (ownerOpt.isEmpty()) return false;

        Owner owner = ownerOpt.get();
        return passwordEncoder.matches(password, owner.getPassword());
    }
}
