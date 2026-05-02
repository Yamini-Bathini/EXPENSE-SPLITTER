package com.example.expensesplitter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GroupDto {
    private Long id;
    private String name;
    private String description;
    private Long createdById;
    private List<UserDto> members;
}
