package com.example.expensesplitter.dto;

import com.example.expensesplitter.model.SplitType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateExpenseRequest {
    @NotBlank
    private String description;

    private String category;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;

    @NotNull
    private SplitType splitType;

    @NotNull
    private Long paidById;

    @NotNull
    private Long groupId;

    private List<SplitDto> splits;
}
