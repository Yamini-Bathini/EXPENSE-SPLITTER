package com.example.expensesplitter.dto;

import lombok.Data;

import java.util.Set;

@Data
public class GroupRequest {
    private String name;
    private String description;
    private Set<Long> memberIds;
}
