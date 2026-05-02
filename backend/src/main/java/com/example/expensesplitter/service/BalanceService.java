package com.example.expensesplitter.service;

import com.example.expensesplitter.dto.BalanceDto;
import com.example.expensesplitter.dto.BalanceSummaryDto;
import com.example.expensesplitter.dto.TransactionDto;
import com.example.expensesplitter.entity.Expense;
import com.example.expensesplitter.entity.Split;
import com.example.expensesplitter.entity.Transaction;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.ExpenseRepository;
import com.example.expensesplitter.repository.TransactionRepository;
import com.example.expensesplitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BalanceService {
    private final ExpenseRepository expenseRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public BalanceSummaryDto getBalanceSummary() {
        List<Expense> expenses = expenseRepository.findAll();
        List<Transaction> transactions = transactionRepository.findAll();

        Map<Long, BigDecimal> netPosition = new HashMap<>();

        for (Expense expense : expenses) {
            for (Split split : expense.getSplits()) {
                Long userId = split.getUser().getId();
                BigDecimal amount = split.getAmount();
                if (!Objects.equals(userId, expense.getPaidBy().getId())) {
                    netPosition.merge(userId, amount.negate(), BigDecimal::add);
                    netPosition.merge(expense.getPaidBy().getId(), amount, BigDecimal::add);
                }
            }
        }

        for (Transaction transaction : transactions) {
            netPosition.merge(transaction.getFromUser().getId(), transaction.getAmount(), BigDecimal::add);
            netPosition.merge(transaction.getToUser().getId(), transaction.getAmount().negate(), BigDecimal::add);
        }

        List<BalanceDto> balances = buildBalances(new HashMap<>(netPosition));
        List<TransactionDto> suggested = suggestSettlements(new HashMap<>(netPosition));
        return new BalanceSummaryDto(balances, suggested);
    }

    @SuppressWarnings("java:S2259")
    private List<BalanceDto> buildBalances(Map<Long, BigDecimal> netPosition) {
        List<BalanceDto> result = new ArrayList<>();
        List<Map.Entry<Long, BigDecimal>> debtors = netPosition.entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(BigDecimal.ZERO) < 0)
                .collect(Collectors.toList());
        List<Map.Entry<Long, BigDecimal>> creditors = netPosition.entrySet().stream()
                .filter(entry -> entry.getValue().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        debtors.sort(Comparator.comparing(Map.Entry<Long, BigDecimal>::getValue));
        creditors.sort(Comparator.comparing(Map.Entry<Long, BigDecimal>::getValue).reversed());

        int i = 0;
        int j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            BigDecimal debtorAmount = debtors.get(i).getValue().abs();
            BigDecimal creditorAmount = creditors.get(j).getValue();
            BigDecimal amount = debtorAmount.min(creditorAmount);
            
            Long fromId = debtors.get(i).getKey();
            Long toId = creditors.get(j).getKey();
            String fromName = fromId != null ? userRepository.findById(fromId).map(User::getUsername).orElse("User " + fromId) : "User";
            String toName = toId != null ? userRepository.findById(toId).map(User::getUsername).orElse("User " + toId) : "User";

            result.add(new BalanceDto(fromId, fromName, toId, toName, amount));
            debtors.get(i).setValue(debtors.get(i).getValue().add(amount));
            creditors.get(j).setValue(creditors.get(j).getValue().subtract(amount));
            if (debtors.get(i).getValue().compareTo(BigDecimal.ZERO) == 0) {
                i++;
            }
            if (creditors.get(j).getValue().compareTo(BigDecimal.ZERO) == 0) {
                j++;
            }
        }
        return result;
    }

    private List<TransactionDto> suggestSettlements(Map<Long, BigDecimal> netPosition) {
        List<BalanceDto> balances = buildBalances(new HashMap<>(netPosition));
        return balances.stream().map(balance -> new TransactionDto(
                null,
                balance.getFromUserId(),
                balance.getFromUserName(),
                balance.getToUserId(),
                balance.getToUserName(),
                balance.getAmount(),
                "Suggested settlement",
                com.example.expensesplitter.model.TransactionStatus.PENDING,
                OffsetDateTime.now()
        )).toList();
    }
}
