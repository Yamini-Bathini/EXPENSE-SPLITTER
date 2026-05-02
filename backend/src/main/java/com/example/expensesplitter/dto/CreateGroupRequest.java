package com.example.expensesplitter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class CreateGroupRequest {
    @NotBlank
    private String name;

    private String description;

    @NotEmpty
    private Set<Long> memberIds;
}
