
package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.dto.OwnerRequest;
import com.osi.shramsaathi.dto.OwnerResponse;
import com.osi.shramsaathi.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController  {

    private final OwnerService ownerService;

    /** Register a new user */
    @PostMapping
    public ResponseEntity<OwnerResponse> register(@Valid @RequestBody OwnerRequest request) {
        OwnerResponse response = ownerService.register(request);
        return ResponseEntity.ok(response);
    }

    /** Get all users */
    @GetMapping
    public ResponseEntity<List<OwnerResponse>> all() {
        return ResponseEntity.ok(ownerService.getAllOwnerResponses());
    }

    /** Search users by work type and district */
    // @GetMapping("/search")
    // public ResponseEntity<List<OwnerResponse>> search(
    //         @RequestParam String workType,
    //         @RequestParam String district) {
    //     return ResponseEntity.ok(ownerService.findByWorkTypeAndDistrict(workType, district));
    // }
}
