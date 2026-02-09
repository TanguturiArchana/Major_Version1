
package com.osi.shramsaathi.controller;

import com.osi.shramsaathi.dto.OwnerRequest;
import com.osi.shramsaathi.dto.OwnerResponse;
import com.osi.shramsaathi.model.Owner;
import com.osi.shramsaathi.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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
    @PutMapping("/update-field/{id}")
    public ResponseEntity<?> updateField(
            @PathVariable Long id,
            @RequestParam String field,
            @RequestParam String value) {
        Owner updated = ownerService.updateField(id, field, value);
        return ResponseEntity.ok(updated);
    }

   @GetMapping("/profile/{id}")
    public ResponseEntity<?> getOwnerProfile(@PathVariable Long id) {
        try {
            OwnerResponse response = ownerService.getOwnerById(id);
            
            return ResponseEntity.ok(response);
        } 
        catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Owner not found"+id);
        }
    }
    @PutMapping("/change-password/{id}")
    public ResponseEntity<String> changePassword(@PathVariable Long id,@RequestBody Map<String, String> req) {
        String oldPassword = req.get("oldPassword");
        String newPassword = req.get("newPassword");
        String result = ownerService.changePassword(id, oldPassword, newPassword);
        if (result.equals("Old password is incorrect")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }


    @GetMapping("/find")
    public ResponseEntity<OwnerResponse> findOwner(@RequestParam String name,@RequestParam String phone) {
        return ResponseEntity.ok(ownerService.findByNameAndPhone(name, phone));
    }

    @GetMapping("/findByNameAndPassword")
    public ResponseEntity<OwnerResponse> findByNameAndPassword(@RequestParam String name,@RequestParam String password) {
        return ResponseEntity.ok(ownerService.findByNameAndPassword(name, password));
    }


    /** Get all users */
    @GetMapping
    public ResponseEntity<List<OwnerResponse>> all() {
        return ResponseEntity.ok(ownerService.getAllOwnerResponses());
    }

    
}
