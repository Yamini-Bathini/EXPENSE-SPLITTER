package com.example.expensesplitter.dto;

import com.example.expensesplitter.model.SplitType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private String description;
    private String category;
    private BigDecimal amount;
    private SplitType splitType;
    private Long paidById;
    private String paidByName;
    private Long groupId;
    private List<SplitDto> splits;
}
