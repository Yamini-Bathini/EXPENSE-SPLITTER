package com.example.expensesplitter.dto;

import com.example.expensesplitter.model.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
public class TransactionDto {
    private Long id;
    private Long fromUserId;
    private String fromUserName;
    private Long toUserId;
    private String toUserName;
    private BigDecimal amount;
    private String note;
    private TransactionStatus status;
    private OffsetDateTime occurredAt;
}
