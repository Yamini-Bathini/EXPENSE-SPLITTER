package com.example.expensesplitter.controller;

import com.example.expensesplitter.dto.ExpenseDto;
import com.example.expensesplitter.dto.ExpenseRequest;
import com.example.expensesplitter.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> addExpense(@RequestBody ExpenseRequest request) {
        ExpenseDto expense = expenseService.addExpenseDto(request);
        return ResponseEntity.ok(expense);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getUserExpenses(Authentication authentication) {
        List<ExpenseDto> expenses = expenseService.getUserExpenseDtos(authentication.getName());
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ExpenseDto>> getGroupExpenses(@PathVariable Long groupId) {
        List<ExpenseDto> expenses = expenseService.getGroupExpenseDtos(groupId);
        return ResponseEntity.ok(expenses);
    }
}
