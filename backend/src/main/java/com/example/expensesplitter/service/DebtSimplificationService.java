package com.example.expensesplitter.service;

import com.example.expensesplitter.dto.DebtBalance;
import com.example.expensesplitter.dto.SettlementTransaction;
import com.example.expensesplitter.entity.Expense;
import com.example.expensesplitter.entity.Split;
import com.example.expensesplitter.entity.Transaction;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.ExpenseRepository;
import com.example.expensesplitter.repository.TransactionRepository;
import com.example.expensesplitter.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@SuppressWarnings({"java:S2259", "java:S6437"})
public class DebtSimplificationService {

    private final ExpenseRepository expenseRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public DebtSimplificationService(ExpenseRepository expenseRepository, TransactionRepository transactionRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<SettlementTransaction> simplifyDebts(Long groupId) {
        Map<Long, BigDecimal> balances = calculateBalances(groupId);
        List<DebtBalance> creditors = extractCreditors(balances);
        List<DebtBalance> debtors = extractDebtors(balances);
        
        sortByBalanceDescending(creditors);
        sortByBalanceDescending(debtors);
        
        return calculateSettlements(debtors, creditors);
    }

    private Map<Long, BigDecimal> calculateBalances(Long groupId) {
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        List<Transaction> transactions = transactionRepository.findByGroupId(groupId);
        Map<Long, BigDecimal> balances = new HashMap<>();

        processExpenses(expenses, balances);
        processTransactions(transactions, balances);
        
        return balances;
    }

    private void processExpenses(List<Expense> expenses, Map<Long, BigDecimal> balances) {
        for (Expense expense : expenses) {
            Long paidById = expense.getPaidBy().getId();
            balances.put(paidById, balances.getOrDefault(paidById, BigDecimal.ZERO).add(expense.getAmount()));

            for (Split split : expense.getSplits()) {
                Long owedById = split.getUser().getId();
                balances.put(owedById, balances.getOrDefault(owedById, BigDecimal.ZERO).subtract(split.getAmount()));
            }
        }
    }

    private void processTransactions(List<Transaction> transactions, Map<Long, BigDecimal> balances) {
        for (Transaction transaction : transactions) {
            Long fromId = transaction.getFromUser().getId();
            Long toId = transaction.getToUser().getId();
            
            balances.put(fromId, balances.getOrDefault(fromId, BigDecimal.ZERO).add(transaction.getAmount()));
            balances.put(toId, balances.getOrDefault(toId, BigDecimal.ZERO).subtract(transaction.getAmount()));
        }
    }

    private List<DebtBalance> extractCreditors(Map<Long, BigDecimal> balances) {
        List<DebtBalance> creditors = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
            Long userId = entry.getKey();
            if (userId == null) {
                continue;
            }
            BigDecimal balance = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                User u = userRepository.findById(userId).orElse(null);
                if (u != null) creditors.add(new DebtBalance(userId, u.getUsername(), balance));
            }
        }
        return creditors;
    }

    private List<DebtBalance> extractDebtors(Map<Long, BigDecimal> balances) {
        List<DebtBalance> debtors = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
            Long userId = entry.getKey();
            if (userId == null) {
                continue;
            }
            BigDecimal balance = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                User u = userRepository.findById(userId).orElse(null);
                if (u != null) debtors.add(new DebtBalance(userId, u.getUsername(), balance.abs()));
            }
        }
        return debtors;
    }

    private void sortByBalanceDescending(List<DebtBalance> balances) {
        balances.sort((a, b) -> b.getBalance().compareTo(a.getBalance()));
    }

    private List<SettlementTransaction> calculateSettlements(List<DebtBalance> debtors, List<DebtBalance> creditors) {
        List<SettlementTransaction> settlements = new ArrayList<>();
        int i = 0;
        int j = 0;

        while (i < debtors.size() && j < creditors.size()) {
            DebtBalance debtor = debtors.get(i);
            DebtBalance creditor = creditors.get(j);

            BigDecimal settleAmount = debtor.getBalance().min(creditor.getBalance());
            
            if (settleAmount.compareTo(BigDecimal.ZERO) > 0) {
                settlements.add(new SettlementTransaction(
                        debtor.getUserId(), debtor.getUsername(),
                        creditor.getUserId(), creditor.getUsername(),
                        settleAmount
                ));
            }

            debtor.setBalance(debtor.getBalance().subtract(settleAmount));
            creditor.setBalance(creditor.getBalance().subtract(settleAmount));

            if (debtor.getBalance().compareTo(BigDecimal.ZERO) == 0) {
                i++;
            }
            if (creditor.getBalance().compareTo(BigDecimal.ZERO) == 0) {
                j++;
            }
        }

        return settlements;
    }
}
