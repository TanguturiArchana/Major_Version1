
package com.osi.shramsaathi.service;

import com.osi.shramsaathi.dto.UserRequest;
import com.osi.shramsaathi.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse register(UserRequest request);

    List<UserResponse> getAllUsers();

    /** ⭐ FIX ADDED */
    UserResponse getUserById(Long id);
}
