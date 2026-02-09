
package com.osi.shramsaathi.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerResponse {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String businessName;
    private String district;
    private String mandal;
    private Integer pincode;
    private Boolean registered;
}
