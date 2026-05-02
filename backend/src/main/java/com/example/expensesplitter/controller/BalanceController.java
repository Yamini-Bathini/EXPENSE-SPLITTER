package com.example.expensesplitter.controller;

import com.example.expensesplitter.dto.BalanceSummaryDto;
import com.example.expensesplitter.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class BalanceController {
    private final BalanceService balanceService;

    @GetMapping
    public BalanceSummaryDto getBalanceSummary() {
        return balanceService.getBalanceSummary();
    }
}
