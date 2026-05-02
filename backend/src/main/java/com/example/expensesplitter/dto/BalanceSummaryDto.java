package com.example.expensesplitter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BalanceSummaryDto {
    private List<BalanceDto> balances;
    private List<TransactionDto> suggestedSettlements;
}
