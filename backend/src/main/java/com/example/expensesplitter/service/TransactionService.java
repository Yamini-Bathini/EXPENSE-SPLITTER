package com.example.expensesplitter.service;

import com.example.expensesplitter.entity.Group;
import com.example.expensesplitter.entity.Transaction;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.GroupRepository;
import com.example.expensesplitter.repository.TransactionRepository;
import com.example.expensesplitter.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

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
    @SuppressWarnings("java:S2259")
    public Transaction recordTransaction(Long fromUserId, Long toUserId, BigDecimal amount, String note) {
        Objects.requireNonNull(fromUserId, "From user id is required");
        Objects.requireNonNull(toUserId, "To user id is required");

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

        return transactionRepository.save(Objects.requireNonNull(transaction));
    }

    public Transaction recordSettlement(Long fromUserId, Long toUserId, Long groupId, BigDecimal amount) {
        Objects.requireNonNull(fromUserId, "From user id is required");
        Objects.requireNonNull(toUserId, "To user id is required");
        Objects.requireNonNull(groupId, "Group id is required");

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

        return transactionRepository.save(Objects.requireNonNull(transaction));
    }

    public List<Transaction> getUserTransactions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(USER_NOT_FOUND));
        return transactionRepository.findByFromUserIdOrToUserId(user.getId(), user.getId());
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

    @Transactional(readOnly = true)
    public List<com.example.expensesplitter.dto.TransactionDto> getUserTransactionDtos(String username) {
        return getUserTransactions(username).stream().map(this::convertToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<com.example.expensesplitter.dto.TransactionDto> getGroupTransactionDtos(Long groupId) {
        return getGroupTransactions(groupId).stream().map(this::convertToDto).toList();
    }
}
