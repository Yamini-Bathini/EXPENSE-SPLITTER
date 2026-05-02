package com.example.expensesplitter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebtBalance {
    private Long userId;
    private String username;
    private BigDecimal balance;
}
