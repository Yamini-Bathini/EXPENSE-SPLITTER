package com.example.expensesplitter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BalanceDto {
    private Long fromUserId;
    private String fromUserName;
    private Long toUserId;
    private String toUserName;
    private BigDecimal amount;
}
