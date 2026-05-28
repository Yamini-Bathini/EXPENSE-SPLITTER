package com.example.expensesplitter.repository;

import com.example.expensesplitter.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByGroupId(Long groupId);
    List<Transaction> findByFromUserIdOrToUserId(Long fromUserId, Long toUserId);

    @Query("SELECT DISTINCT t FROM Transaction t WHERE t.fromUser.id = :userId OR t.toUser.id = :userId OR t.group.id IN (SELECT g.id FROM Group g JOIN g.members m WHERE m.id = :userId)")
    List<Transaction> findTransactionsForUserGroups(@Param("userId") Long userId);
}
