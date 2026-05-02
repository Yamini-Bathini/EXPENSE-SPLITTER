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

    @SuppressWarnings("java:S2259")
    public Expense addExpense(ExpenseRequest request) {
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        User paidBy = userRepository.findById(request.getPaidById())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Expense expense = Expense.builder()
                .description(request.getDescription())
                .category(request.getCategory())
                .amount(request.getAmount())
                .group(group)
                .paidBy(paidBy)
                .splitType(request.getSplitType())
                .splits(new ArrayList<>())
                .build();

        for (ExpenseSplitRequest splitReq : request.getSplits()) {
            User user = userRepository.findById(splitReq.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Split split = Split.builder()
                    .expense(expense)
                    .user(user)
                    .amount(splitReq.getAmount())
                    .build();

            expense.getSplits().add(split);
        }

        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public List<Expense> getGroupExpenses(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }

    private ExpenseDto convertToDto(Expense expense) {
        List<SplitDto> splitDtos = expense.getSplits().stream()
                .map(split -> new SplitDto(split.getUser().getId(), split.getUser().getUsername(), split.getAmount()))
                .toList();
        return new ExpenseDto(expense.getId(), expense.getDescription(), expense.getCategory(),
                             expense.getAmount(), expense.getSplitType(), expense.getPaidBy().getId(),
                             expense.getPaidBy().getUsername(), expense.getGroup().getId(), splitDtos);
    }

    public ExpenseDto addExpenseDto(ExpenseRequest request) {
        Expense expense = addExpense(request);
        return convertToDto(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseDto> getAllExpenseDtos() {
        List<Expense> expenses = getAllExpenses();
        return expenses.stream().map(this::convertToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ExpenseDto> getGroupExpenseDtos(Long groupId) {
        List<Expense> expenses = getGroupExpenses(groupId);
        return expenses.stream().map(this::convertToDto).toList();
    }
}
