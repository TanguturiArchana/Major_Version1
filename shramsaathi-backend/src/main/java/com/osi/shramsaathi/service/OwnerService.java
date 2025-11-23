package com.osi.shramsaathi.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.osi.shramsaathi.dto.OwnerRequest;
import com.osi.shramsaathi.dto.OwnerResponse;
import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.repository.OwnerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class OwnerService {

    private final OwnerRepository ownerRepository;
    private final BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder();
    
    public OwnerResponse getOwnerById(Long id) {
        Owner owner = ownerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Owner not found"));
        return mapToResponse(owner);


    }

   
    public Owner updateField(Long id, String field, String value) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        switch (field) {
            case "phone": owner.setPhone(value); break;
            case "businessName": owner.setBusinessName(value); break;
            case "address": owner.setAddress(value); break;
            case "district": owner.setDistrict(value); break;
            case "mandal": owner.setMandal(value); break;
            case "pincode": owner.setPincode(Integer.parseInt(value)); break;
            case "registered": owner.setRegistered(Boolean.parseBoolean(value)); break;
            default: throw new RuntimeException("Invalid field");
        }

        return ownerRepository.save(owner);
    }
    public String changePassword(Long id, String oldPassword, String newPassword) {

        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, owner.getPassword())) {
            return "Old password is incorrect";
        }

        // Update password
        owner.setPassword(passwordEncoder.encode(newPassword));
        ownerRepository.save(owner);

        return "Password updated successfully";
    }

    public OwnerResponse findByNameAndPassword(String name, String password) {
    // Fetch all owners with the given name
        List<Owner> owners = ownerRepository.findAllByName(name);

    // Loop through each owner and verify password
        for (Owner owner : owners) {
            if (passwordEncoder.matches(password, owner.getPassword())) {
                return mapToResponse(owner);
            }
        }   

    // If no matching password found
        throw new RuntimeException("Owner With Given Password And name is not found :Invalid credentials");
    }




    public OwnerResponse register(OwnerRequest request) {
        // Generate a default password if not provided
        String password = request.getPassword() != null && !request.getPassword().isEmpty() 
            ? request.getPassword() 
            : "owner123"; // Default password
        
        Owner owner = Owner.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .businessName(request.getBusinessName())
                .district(request.getDistrict())
                .mandal(request.getMandal())
                .pincode(request.getPincode())
                .password(password)
                .registered(true)
                .build();

        ownerRepository.save(owner);
        return mapToResponse(owner);
    }

    public List<OwnerResponse> getAllOwnerResponses() {
        return ownerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    public OwnerResponse findByNameAndPhone(String name, String phone) {
    Owner owner = ownerRepository.findByNameAndPhone(name, phone)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

    return OwnerResponse.builder()
            .id(owner.getId())
            .name(owner.getName())
            .phone(owner.getPhone())
            .address(owner.getAddress())
            .businessName(owner.getBusinessName())
            .district(owner.getDistrict())
            .mandal(owner.getMandal())
            .pincode(owner.getPincode())
            .registered(owner.getRegistered())
            .build();
}


    private OwnerResponse mapToResponse(Owner owner) {
        return OwnerResponse.builder()
                .id(owner.getId())
                .name(owner.getName())
                .phone(owner.getPhone())
                .address(owner.getAddress())
                .businessName(owner.getBusinessName())
                .district(owner.getDistrict())
                .mandal(owner.getMandal())
                .pincode(owner.getPincode())
                .registered(owner.getRegistered())
                .build();
    }
}
