/*package com.osi.shramsaathi.service;

import com.osi.shramsaathi.model.User;
import java.util.List;

public interface UserService {
    User register(User user);
    List<User> getAllUsers();
    List<User> findByWorkTypeAndDistrict(String workType, String district);
}
*/

package com.osi.shramsaathi.service;

import com.osi.shramsaathi.dto.UserRequest;
import com.osi.shramsaathi.dto.UserResponse;
import java.util.List;

public interface UserService {

    /** Registers a new user from the request data */
    UserResponse register(UserRequest request);

    /** Fetches all registered users */
    List<UserResponse> getAllUsers();
}
