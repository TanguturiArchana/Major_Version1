package com.osi.shramsaathi.service.impl;

import com.osi.shramsaathi.dto.UserRequest;
import com.osi.shramsaathi.dto.UserResponse;
import com.osi.shramsaathi.model.User;
import com.osi.shramsaathi.repository.UserRepository;
import com.osi.shramsaathi.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    /**
     * Registers a new user with details provided in the request
     */
    @Override
    public UserResponse register(UserRequest request) {
        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .workType(request.getWorkType())
                .district(request.getDistrict())
                .mandal(request.getMandal())
                .pincode(request.getPincode())
                .registered(true)
                .build();

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    /**
     * Retrieves all users from the database
     */
    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

   

    /**
     * Maps a User entity to a UserResponse DTO
     */
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
                .registered(user.getRegistered())
                .build();
    }
}
