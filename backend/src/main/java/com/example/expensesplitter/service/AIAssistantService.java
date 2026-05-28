package com.example.expensesplitter.service;

import com.example.expensesplitter.dto.BalanceDto;
import com.example.expensesplitter.entity.Expense;
import com.example.expensesplitter.entity.Group;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.ExpenseRepository;
import com.example.expensesplitter.repository.GroupRepository;
import com.example.expensesplitter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AIAssistantService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BalanceService balanceService;

    public String processMessage(String message, String username) {
        String lowerMessage = message.toLowerCase();

        // Get user
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return "I couldn't find your user account. Please try logging in again.";
        }

        // Expense queries
        if (lowerMessage.contains("how much") || lowerMessage.contains("spent") || lowerMessage.contains("total")) {
            return handleExpenseQuery(lowerMessage, user);
        }

        // Balance queries
        if (lowerMessage.contains("balance") || lowerMessage.contains("owe") || lowerMessage.contains("owed")) {
            return handleBalanceQuery(user);
        }

        // Split suggestions
        if (lowerMessage.contains("split") || lowerMessage.contains("divide") || lowerMessage.contains("share")) {
            return handleSplitSuggestion(lowerMessage);
        }

        // Group queries
        if (lowerMessage.contains("group") || lowerMessage.contains("member")) {
            return handleGroupQuery(user);
        }

        // Default responses
        if (lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            return "Hello! I'm your expense assistant. I can help you with expense queries, balance information, and splitting suggestions. What would you like to know?";
        }

        if (lowerMessage.contains("help")) {
            return "I can help you with:\n\n• Expense queries (e.g., 'How much did I spend on food?')\n• Balance information (e.g., 'What do I owe?')\n• Split suggestions (e.g., 'How should we split a $50 bill?')\n• Group information\n\nWhat would you like to know?";
        }

        return "I'm not sure I understand that request. Try asking about your expenses, balances, or splitting suggestions!";
    }

    private String handleExpenseQuery(String message, User user) {
        try {
            List<Expense> userExpenses = expenseRepository.findByPaidById(user.getId());

            if (userExpenses.isEmpty()) {
                return "You haven't added any expenses yet. Try creating your first expense!";
            }

            BigDecimal total = userExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Check for category-specific queries
            if (message.contains("food")) {
                BigDecimal foodTotal = userExpenses.stream()
                    .filter(e -> "Food & Dining".equals(e.getCategory()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                return String.format("You've spent $%.2f on food & dining from %d expenses.",
                    foodTotal, userExpenses.stream().filter(e -> "Food & Dining".equals(e.getCategory())).count());
            }

            return String.format("You've spent a total of $%.2f across %d expenses.",
                total, userExpenses.size());

        } catch (Exception e) {
            return "I had trouble accessing your expense data. Please try again.";
        }
    }

    private String handleBalanceQuery(User user) {
        try {
            var balanceSummary = balanceService.getBalanceSummary(user.getUsername());

            // Filter balances where user owes money (fromUserId == user.id)
            List<BalanceDto> userBalances = balanceSummary.getBalances().stream()
                .filter(b -> b.getFromUserId().equals(user.getId()))
                .toList();

            if (userBalances.isEmpty()) {
                return "You don't have any outstanding balances. Great job staying settled up!";
            }

            BigDecimal totalOwed = userBalances.stream()
                .map(BalanceDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            return String.format("You owe a total of $%.2f to %d people. Check your Balances page for details.",
                totalOwed, userBalances.size());

        } catch (Exception e) {
            return "I had trouble checking your balances. Please try again.";
        }
    }

    private String handleSplitSuggestion(String message) {
        // Extract amount from message
        Pattern amountPattern = Pattern.compile("\\$?(\\d+(?:\\.\\d{2})?)");
        Matcher matcher = amountPattern.matcher(message);

        if (matcher.find()) {
            try {
                BigDecimal amount = new BigDecimal(matcher.group(1));

                // Check for number of people
                Pattern peoplePattern = Pattern.compile("(\\d+)\\s*(?:people|persons?|friends?|members?)");
                Matcher peopleMatcher = peoplePattern.matcher(message);

                int people = 2; // default
                if (peopleMatcher.find()) {
                    people = Integer.parseInt(peopleMatcher.group(1));
                }

                BigDecimal splitAmount = amount.divide(BigDecimal.valueOf(people), 2, RoundingMode.HALF_UP);

                return String.format("For a $%.2f bill split among %d people, each person should pay $%.2f.",
                    amount, people, splitAmount);

            } catch (Exception e) {
                return "I couldn't parse that amount. Try something like 'How should we split a $50 bill among 4 people?'";
            }
        }

        return "I'd be happy to help you split a bill! Try asking something like 'How should we split a $50 bill among 4 people?'";
    }

    private String handleGroupQuery(User user) {
        try {
            List<Group> userGroups = groupRepository.findByMembers_Id(user.getId());

            if (userGroups.isEmpty()) {
                return "You haven't joined any groups yet. Try creating or joining a group!";
            }

            return String.format("You're a member of %d group(s): %s",
                userGroups.size(),
                userGroups.stream().map(Group::getName).reduce((a, b) -> a + ", " + b).orElse(""));

        } catch (Exception e) {
            return "I had trouble accessing your group information. Please try again.";
        }
    }
}