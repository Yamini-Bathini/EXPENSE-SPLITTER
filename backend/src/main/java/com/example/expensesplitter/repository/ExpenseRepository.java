package com.example.expensesplitter.repository;

import com.example.expensesplitter.entity.Expense;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @EntityGraph(attributePaths = {"splits", "splits.user", "paidBy", "group"})
    List<Expense> findByGroupId(Long groupId);

    List<Expense> findByPaidById(Long userId);

    @Query("SELECT DISTINCT e FROM Expense e LEFT JOIN e.splits s WHERE e.group.id IN (SELECT g.id FROM Group g JOIN g.members m WHERE m.id = :userId) OR e.paidBy.id = :userId OR s.user.id = :userId")
    List<Expense> findExpensesForUser(@Param("userId") Long userId);
}
