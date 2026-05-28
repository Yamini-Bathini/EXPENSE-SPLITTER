package com.example.expensesplitter.service;

import com.example.expensesplitter.dto.ExpenseDto;
import com.example.expensesplitter.dto.ExpenseRequest;
import com.example.expensesplitter.dto.SplitDto;
import com.example.expensesplitter.dto.ExpenseSplitRequest;
import com.example.expensesplitter.entity.Expense;
import com.example.expensesplitter.entity.Group;
import com.example.expensesplitter.entity.Split;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.GroupRepository;
import com.example.expensesplitter.repository.ExpenseRepository;
import com.example.expensesplitter.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, GroupRepository groupRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    private static final String USER_NOT_FOUND = "User not found";

    @SuppressWarnings("java:S2259")
    public Expense addExpense(ExpenseRequest request) {
        Long groupId = Objects.requireNonNull(request.getGroupId(), "Group id is required");
        Long paidById = Objects.requireNonNull(request.getPaidById(), "Paid by user id is required");

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        User paidBy = userRepository.findById(paidById)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));

        Expense expense = Expense.builder()
                .description(request.getDescription())
                .category(request.getCategory())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .group(group)
                .paidBy(paidBy)
                .splitType(request.getSplitType())
                .splits(new ArrayList<>())
                .build();

        java.math.BigDecimal equalSplitAmount = java.math.BigDecimal.ZERO;
        if (request.getSplits() != null && !request.getSplits().isEmpty()) {
            equalSplitAmount = request.getAmount().divide(java.math.BigDecimal.valueOf(request.getSplits().size()), 2, java.math.RoundingMode.HALF_UP);
        }

        if (request.getSplits() != null) {
            for (ExpenseSplitRequest splitReq : request.getSplits()) {
                Long splitUserId = Objects.requireNonNull(splitReq.getUserId(), "Split user id is required");
                User user = userRepository.findById(splitUserId)
                        .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));

                java.math.BigDecimal splitAmount = request.getSplitType() == com.example.expensesplitter.model.SplitType.EQUAL
                                         ? equalSplitAmount
                                         : splitReq.getAmount();

                Split split = Split.builder()
                        .expense(expense)
                        .user(user)
                        .amount(splitAmount)
                        .build();

                expense.getSplits().add(split);
            }
        }

        return expenseRepository.save(Objects.requireNonNull(expense));
    }

    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(Objects.requireNonNull(expense));
    }

    public List<Expense> getUserExpenses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        return expenseRepository.findExpensesForUser(user.getId());
    }

    public List<Expense> getGroupExpenses(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    private ExpenseDto convertToDto(Expense expense) {
        List<SplitDto> splitDtos = expense.getSplits().stream()
                .map(split -> new SplitDto(split.getUser().getId(), split.getUser().getUsername(), split.getAmount()))
                .toList();
        return new ExpenseDto(expense.getId(), expense.getDescription(), expense.getCategory(),
                             expense.getAmount(), expense.getCurrency(), expense.getSplitType(), expense.getPaidBy().getId(),
                             expense.getPaidBy().getUsername(), expense.getGroup().getId(), splitDtos, expense.getCreatedAt());
    }

    public ExpenseDto addExpenseDto(ExpenseRequest request) {
        Expense expense = addExpense(request);
        return convertToDto(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseDto> getUserExpenseDtos(String username) {
        List<Expense> expenses = getUserExpenses(username);
        return expenses.stream().map(this::convertToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseDto> getGroupExpenseDtos(Long groupId) {
        List<Expense> expenses = getGroupExpenses(groupId);
        return expenses.stream().map(this::convertToDto).toList();
    }
}
