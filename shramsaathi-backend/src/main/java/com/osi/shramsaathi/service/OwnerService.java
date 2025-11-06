package com.osi.shramsaathi.service;

import com.osi.shramsaathi.dto.OwnerRequest;
import com.osi.shramsaathi.dto.OwnerResponse;
import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerService {

    private final OwnerRepository ownerRepository;

    public OwnerResponse register(OwnerRequest request) {
        Owner owner = Owner.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .businessName(request.getBusinessName())
                .district(request.getDistrict())
                .mandal(request.getMandal())
                .pincode(request.getPincode())
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
