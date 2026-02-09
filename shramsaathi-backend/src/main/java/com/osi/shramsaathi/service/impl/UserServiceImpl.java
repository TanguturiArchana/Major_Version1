

package com.osi.shramsaathi.service.impl;

import java.util.List;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.osi.shramsaathi.dto.OwnerResponse;
import com.osi.shramsaathi.dto.UserRequest;
import com.osi.shramsaathi.dto.UserResponse;
import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.model.User;
import com.osi.shramsaathi.repository.UserRepository;
import com.osi.shramsaathi.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
     private final BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder();

    @Override
    public UserResponse register(UserRequest request) {

        String password = request.getPassword() != null && !request.getPassword().isEmpty()
                ? request.getPassword()
                : "worker123";

        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .workType(request.getWorkType())
                .district(request.getDistrict())
                .mandal(request.getMandal())
                .pincode(request.getPincode())
                .area(request.getArea())
                .colony(request.getColony())
                .state(request.getState())
                .age(request.getAge())
                .experienceYears(request.getExperienceYears())
                .password(password)
                .registered(true)
                .build();

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

  
    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toResponse(user);
    }
     public User updateField(Long id, String field, String value) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("user not found"));

        switch (field) {
            case "phone": user.setPhone(value); break;
            case "address": user.setAddress(value); break;
            case "district": user.setDistrict(value); break;
            case "mandal": user.setMandal(value); break;
            case "pincode": user.setPincode(Integer.parseInt(value)); break;
            case "registered": user.setRegistered(Boolean.parseBoolean(value)); break;
            default: throw new RuntimeException("Invalid field");
        }

        return userRepository.save(user);
    }
    public String changePassword(Long id, String oldPassword, String newPassword) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("user not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return "Old password is incorrect";
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return "Password updated successfully";
    }

    public UserResponse findByNameAndPassword(String name, String password) {
    // Fetch all users with the given name
        List<User> users = userRepository.findAllByName(name);

    // Loop through each user and verify password
        for (User user : users) {
            if (passwordEncoder.matches(password, user.getPassword())) {
                return toResponse(user);
            }
        }   

    // If no matching password found
        throw new RuntimeException("Owner With Given Password And name is not found :Invalid credentials");
    }
    /** Convert User → UserResponse DTO */
    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .workType(user.getWorkType())
                .district(user.getDistrict())
                .mandal(user.getMandal())
                .pincode(user.getPincode())
                .area(user.getArea())
                .colony(user.getColony())
                .state(user.getState())
                .registered(user.getRegistered())
                .age(user.getAge())
                .experienceYears(user.getExperienceYears())
                .build();
    }

     @Override
    public UserResponse findByNameAndPhone(String name, String phone) {
    User user = userRepository.findByNameAndPhone(name, phone)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

    return UserResponse.builder()
           .id(user.getId())
                .name(user.getName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .workType(user.getWorkType())
                .district(user.getDistrict())
                .mandal(user.getMandal())
                .pincode(user.getPincode())
                .area(user.getArea())
                .colony(user.getColony())
                .state(user.getState())
                .registered(user.getRegistered())
                .age(user.getAge())
                .experienceYears(user.getExperienceYears())
                .build();
}
}