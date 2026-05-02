package com.example.expensesplitter.repository;

import com.example.expensesplitter.entity.Expense;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @EntityGraph(attributePaths = {"splits", "splits.user", "paidBy", "group"})
    List<Expense> findAll();

    @EntityGraph(attributePaths = {"splits", "splits.user", "paidBy", "group"})
    List<Expense> findByGroupId(Long groupId);

    List<Expense> findByPaidById(Long userId);
}
