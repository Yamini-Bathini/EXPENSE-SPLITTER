package com.example.expensesplitter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettlementTransaction {
    private Long fromUserId;
    private String fromUsername;
    private Long toUserId;
    private String toUsername;
    private BigDecimal amount;
}
