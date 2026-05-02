package com.example.expensesplitter.controller;

import com.example.expensesplitter.entity.Transaction;
import com.example.expensesplitter.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<Transaction> recordTransaction(@RequestBody Map<String, Object> payload) {
        Long fromUserId = ((Number) payload.get("fromUserId")).longValue();
        Long toUserId = ((Number) payload.get("toUserId")).longValue();
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String note = payload.get("note") != null ? payload.get("note").toString() : "";

        Transaction transaction = transactionService.recordTransaction(fromUserId, toUserId, amount, note);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/settle")
    public ResponseEntity<Transaction> recordSettlement(@RequestBody Map<String, Object> payload) {
        Long fromUserId = ((Number) payload.get("fromUserId")).longValue();
        Long toUserId = ((Number) payload.get("toUserId")).longValue();
        Long groupId = ((Number) payload.get("groupId")).longValue();
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());

        Transaction transaction = transactionService.recordSettlement(fromUserId, toUserId, groupId, amount);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Transaction>> getGroupTransactions(@PathVariable Long groupId) {
        List<Transaction> transactions = transactionService.getGroupTransactions(groupId);
        return ResponseEntity.ok(transactions);
    }
}
