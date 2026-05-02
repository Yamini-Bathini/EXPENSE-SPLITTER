package com.example.expensesplitter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SplitDto {
    private Long userId;
    private String userName;
    private BigDecimal amount;
}
