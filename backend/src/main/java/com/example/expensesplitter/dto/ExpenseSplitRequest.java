package com.example.expensesplitter.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseSplitRequest {
    private Long userId;
    private BigDecimal amount;
    private BigDecimal percentage;
}
