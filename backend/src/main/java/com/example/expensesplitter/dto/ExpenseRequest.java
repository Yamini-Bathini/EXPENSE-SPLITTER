package com.example.expensesplitter.dto;

import com.example.expensesplitter.model.SplitType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ExpenseRequest {
    private String description;
    private String category;
    private BigDecimal amount;
    private Long groupId;
    private Long paidById;
    private SplitType splitType;
    private List<ExpenseSplitRequest> splits;
}
