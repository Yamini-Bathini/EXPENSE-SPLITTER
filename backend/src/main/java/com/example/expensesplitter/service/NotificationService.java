package com.example.expensesplitter.service;

import com.example.expensesplitter.dto.BalanceSummaryDto;
import com.example.expensesplitter.dto.TransactionDto;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final BalanceService balanceService;
    private final UserRepository userRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public void sendRemindersForUser(String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BalanceSummaryDto summary = balanceService.getBalanceSummary(username);

        List<TransactionDto> owedToMe = summary.getSuggestedSettlements().stream()
                .filter(t -> Objects.equals(t.getToUserId(), currentUser.getId()))
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .filter(t -> t.getFromUserId() != null)
                .toList();

        for (TransactionDto tx : owedToMe) {
            userRepository.findById(Objects.requireNonNull(tx.getFromUserId()))
                    .ifPresent(debtor -> {
                        if (debtor.getEmail() == null || debtor.getEmail().isBlank()) {
                            log.info("Email not found for user {}. Skipping notification.", debtor.getUsername());
                            return;
                        }

                        String subject = String.format("Reminder: You owe %s money", currentUser.getUsername());
                        String body = String.format(
                                "Hello %s,%n%nYou currently owe %s $%s on Expense Splitter. Please settle your debt with %s at your earliest convenience.%n%nThank you.",
                                debtor.getUsername(), currentUser.getUsername(), tx.getAmount(), currentUser.getUsername());

                        sendEmail(debtor.getEmail(), subject, body);
                    });
        }
    }

    public void sendTestEmail(String email, String message) {
        if (email == null || email.isBlank()) {
            log.warn("Test email not sent because destination email is empty");
            return;
        }

        sendEmail(email, "Expense Splitter Test Email", message);
    }

    private void sendEmail(String to, String subject, String body) {
        log.info("--- EMAIL NOTIFICATION ---");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", body);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Email sending is disabled because no JavaMailSender bean is configured.");
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(body);

            mailSender.send(mailMessage);
            log.info("Email sent successfully to {}", to);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage(), ex);
        }
    }
}
