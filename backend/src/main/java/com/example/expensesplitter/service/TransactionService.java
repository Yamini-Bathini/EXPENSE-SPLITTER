package com.example.expensesplitter.service;

import com.example.expensesplitter.entity.Group;
import com.example.expensesplitter.entity.Transaction;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.GroupRepository;
import com.example.expensesplitter.repository.TransactionRepository;
import com.example.expensesplitter.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {
    private static final String USER_NOT_FOUND = "User not found";

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, GroupRepository groupRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
    }
    @SuppressWarnings("java:S2259")    public Transaction recordTransaction(Long fromUserId, Long toUserId, BigDecimal amount, String note) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        Transaction transaction = Transaction.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .amount(amount)
                .note(note)
                .status(com.example.expensesplitter.model.TransactionStatus.PENDING)
                .occurredAt(java.time.OffsetDateTime.now())
                .build();

        return transactionRepository.save(transaction);
    }

    public Transaction recordSettlement(Long fromUserId, Long toUserId, Long groupId, BigDecimal amount) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        Transaction transaction = Transaction.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .group(group)
                .amount(amount)
                .status(com.example.expensesplitter.model.TransactionStatus.SETTLED)
                .occurredAt(java.time.OffsetDateTime.now())
                .build();

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getGroupTransactions(Long groupId) {
        return transactionRepository.findByGroupId(groupId);
    }

    private com.example.expensesplitter.dto.TransactionDto convertToDto(Transaction transaction) {
        return new com.example.expensesplitter.dto.TransactionDto(
                transaction.getId(),
                transaction.getFromUser().getId(),
                transaction.getFromUser().getUsername(),
                transaction.getToUser().getId(),
                transaction.getToUser().getUsername(),
                transaction.getAmount(),
                transaction.getNote(),
                transaction.getStatus(),
                transaction.getOccurredAt()
        );
    }

    public List<com.example.expensesplitter.dto.TransactionDto> getAllTransactionDtos() {
        return getAllTransactions().stream().map(this::convertToDto).toList();
    }

    public List<com.example.expensesplitter.dto.TransactionDto> getGroupTransactionDtos(Long groupId) {
        return getGroupTransactions(groupId).stream().map(this::convertToDto).toList();
    }
}
