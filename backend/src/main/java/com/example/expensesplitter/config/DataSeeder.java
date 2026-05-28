package com.example.expensesplitter.config;

import com.example.expensesplitter.entity.Expense;
import com.example.expensesplitter.entity.Group;
import com.example.expensesplitter.entity.Split;
import com.example.expensesplitter.entity.Transaction;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.model.SplitType;
import com.example.expensesplitter.model.TransactionStatus;
import com.example.expensesplitter.repository.ExpenseRepository;
import com.example.expensesplitter.repository.GroupRepository;
import com.example.expensesplitter.repository.TransactionRepository;
import com.example.expensesplitter.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, GroupRepository groupRepository,
                      ExpenseRepository expenseRepository, TransactionRepository transactionRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static final String PASSWORD = "password123"; // SonarQube: test data password
    private static final String AMOUNT_600 = "600.00";
    private static final String AMOUNT_200 = "200.00";
    private static final String AMOUNT_300 = "300.00";
    private static final String AMOUNT_900 = "900.00";
    private static final String AMOUNT_150 = "150.00";
    private static final String AMOUNT_1200 = "1200.00";
    private static final String AMOUNT_100 = "100.00";
    private static final String AMOUNT_70 = "70.00";
    private static final String AMOUNT_80 = "80.00";
    private static final String AMOUNT_20000 = "200.00";
    private static final String AMOUNT_60000 = "600.00";
    private static final String AMOUNT_40 = "40.00";
    private static final String AMOUNT_60 = "60.00";
    private static final String AMOUNT_10 = "10.00";
    @SuppressWarnings({"java:S6437", "java:S2068"})
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User user0 = new User(null, "testuser", "testuser@example.com", passwordEncoder.encode(PASSWORD));
            User user1 = new User(null, "alice", "alice@example.com", passwordEncoder.encode(PASSWORD));
            User user2 = new User(null, "bob", "bob@example.com", passwordEncoder.encode(PASSWORD));
            User user3 = new User(null, "charlie", "charlie@example.com", passwordEncoder.encode(PASSWORD));

            userRepository.save(user0);
            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);

            Set<User> allUsers = new HashSet<>();
            allUsers.add(user0);
            allUsers.add(user1);
            allUsers.add(user2);
            allUsers.add(user3);

            Group tripGroup = Objects.requireNonNull(Group.builder()
                    .name("Miami Trip")
                    .description("Weekend getaway")
                    .createdBy(user1)
                    .members(allUsers)
                    .build());

            Set<User> aptUsers = new HashSet<>();
            aptUsers.add(user1);
            aptUsers.add(user2);

            Group aptGroup = Objects.requireNonNull(Group.builder()
                    .name("Apartment 4B")
                    .description("Shared living expenses")
                    .createdBy(user2)
                    .members(aptUsers)
                    .build());

            groupRepository.save(tripGroup);
            groupRepository.save(aptGroup);
            
            // Expense 1: Flight (Miami Trip) paid by Alice, split equally
            Expense flight = new Expense();
            flight.setDescription("Flight to Miami");
            flight.setCategory("Travel");
            flight.setAmount(new BigDecimal(AMOUNT_600));
            flight.setGroup(tripGroup);
            flight.setPaidBy(user1);
            flight.setSplitType(SplitType.EQUAL);

            Split fSplit1 = Split.builder().user(user1).expense(flight).amount(new BigDecimal(AMOUNT_200)).build();
            Split fSplit2 = Split.builder().user(user2).expense(flight).amount(new BigDecimal(AMOUNT_200)).build();
            Split fSplit3 = Split.builder().user(user3).expense(flight).amount(new BigDecimal(AMOUNT_200)).build();
            flight.getSplits().add(fSplit1);
            flight.getSplits().add(fSplit2);
            flight.getSplits().add(fSplit3);
            expenseRepository.save(flight);

            // Expense 2: Hotel (Miami Trip) paid by Bob, split equally
            Expense hotel = new Expense();
            hotel.setDescription("Hotel Airbnb");
            hotel.setCategory("Accommodation");
            hotel.setAmount(new BigDecimal(AMOUNT_900));
            hotel.setGroup(tripGroup);
            hotel.setPaidBy(user2);
            hotel.setSplitType(SplitType.EQUAL);

            Split hSplit1 = Split.builder().user(user1).expense(hotel).amount(new BigDecimal(AMOUNT_300)).build();
            Split hSplit2 = Split.builder().user(user2).expense(hotel).amount(new BigDecimal(AMOUNT_300)).build();
            Split hSplit3 = Split.builder().user(user3).expense(hotel).amount(new BigDecimal(AMOUNT_300)).build();
            hotel.getSplits().add(hSplit1);
            hotel.getSplits().add(hSplit2);
            hotel.getSplits().add(hSplit3);
            expenseRepository.save(hotel);

            // Expense 3: Dinner (Miami Trip) paid by Charlie, split custom
            Expense dinner = new Expense();
            dinner.setDescription("Seafood Dinner");
            dinner.setCategory("Food");
            dinner.setAmount(new BigDecimal(AMOUNT_150));
            dinner.setGroup(tripGroup);
            dinner.setPaidBy(user3);
            dinner.setSplitType(SplitType.CUSTOM);

            Split dSplit1 = Split.builder().user(user1).expense(dinner).amount(new BigDecimal(AMOUNT_70)).build();
            Split dSplit2 = Split.builder().user(user2).expense(dinner).amount(new BigDecimal(AMOUNT_80)).build();
            Split dSplit3 = Split.builder().user(user3).expense(dinner).amount(new BigDecimal("0.00")).build(); // Charlie paid but others ate
            dinner.getSplits().add(dSplit1);
            dinner.getSplits().add(dSplit2);
            dinner.getSplits().add(dSplit3);
            expenseRepository.save(dinner);

            // Expense 4: Rent (Apartment 4B) paid by Alice, split equally
            Expense rent = new Expense();
            rent.setDescription("October Rent");
            rent.setCategory("Housing");
            rent.setAmount(new BigDecimal(AMOUNT_1200));
            rent.setGroup(aptGroup);
            rent.setPaidBy(user1);
            rent.setSplitType(SplitType.EQUAL);

            Split rSplit1 = Split.builder().user(user1).expense(rent).amount(new BigDecimal(AMOUNT_600)).build();
            Split rSplit2 = Split.builder().user(user2).expense(rent).amount(new BigDecimal(AMOUNT_600)).build();
            rent.getSplits().add(rSplit1);
            rent.getSplits().add(rSplit2);
            expenseRepository.save(rent);

            // Expense 5: Groceries (Apartment 4B) paid by Bob, split custom
            Expense groceries = new Expense();
            groceries.setDescription("Groceries");
            groceries.setCategory("Food");
            groceries.setAmount(new BigDecimal(AMOUNT_100));
            groceries.setGroup(aptGroup);
            groceries.setPaidBy(user2);
            groceries.setSplitType(SplitType.CUSTOM);

            Split gSplit1 = Split.builder().user(user1).expense(groceries).amount(new BigDecimal(AMOUNT_40)).build();
            Split gSplit2 = Split.builder().user(user2).expense(groceries).amount(new BigDecimal(AMOUNT_60)).build();
            groceries.getSplits().add(gSplit1);
            groceries.getSplits().add(gSplit2);
            expenseRepository.save(groceries);

            // Create sample transactions
            Transaction t1 = Objects.requireNonNull(Transaction.builder()
                    .group(tripGroup)
                    .fromUser(user2)
                    .toUser(user1)
                    .amount(new BigDecimal(AMOUNT_20000))
                    .note("Flight reimbursement")
                    .status(TransactionStatus.SETTLED)
                    .occurredAt(java.time.OffsetDateTime.now().minusDays(3))
                    .build());
            transactionRepository.save(t1);

            Transaction t2 = Objects.requireNonNull(Transaction.builder()
                    .group(tripGroup)
                    .fromUser(user3)
                    .toUser(user2)
                    .amount(new BigDecimal(AMOUNT_300))
                    .note("Hotel reimbursement")
                    .status(TransactionStatus.SETTLED)
                    .occurredAt(java.time.OffsetDateTime.now().minusDays(2))
                    .build());
            transactionRepository.save(t2);

            Transaction t3 = Transaction.builder()
                    .group(aptGroup)
                    .fromUser(user2)
                    .toUser(user1)
                    .amount(new BigDecimal(AMOUNT_60000))
                    .note("Rent settlement")
                    .status(TransactionStatus.PENDING)
                    .occurredAt(java.time.OffsetDateTime.now())
                    .build();
            transactionRepository.save(Objects.requireNonNull(t3));

            // Additional data to make balances more interesting
            // Expense 6: Coffee (Miami Trip) paid by Alice, split equally
            Expense coffee = new Expense();
            coffee.setDescription("Morning Coffee");
            coffee.setCategory("Food");
            coffee.setAmount(new BigDecimal("24.00"));
            coffee.setGroup(tripGroup);
            coffee.setPaidBy(user1);
            coffee.setSplitType(SplitType.EQUAL);

            allUsers.forEach(u -> {
                Split s = Split.builder().user(u).expense(coffee).amount(new BigDecimal("6.00")).build();
                coffee.getSplits().add(s);
            });
            expenseRepository.save(coffee);

            // Expense 7: Gas (Miami Trip) paid by testuser, split equally
            Expense gas = new Expense();
            gas.setDescription("Gas for rental car");
            gas.setCategory("Transportation");
            gas.setAmount(new BigDecimal(AMOUNT_80));
            gas.setGroup(tripGroup);
            gas.setPaidBy(user0);
            gas.setSplitType(SplitType.EQUAL);

            allUsers.forEach(u -> {
                Split s = Split.builder().user(u).expense(gas).amount(new BigDecimal("20.00")).build();
                gas.getSplits().add(s);
            });
            expenseRepository.save(gas);

            // Expense 8: Electricity (Apartment 4B) paid by Alice, split equally
            Expense electricity = new Expense();
            electricity.setDescription("Electricity Bill");
            electricity.setCategory("Utilities");
            electricity.setAmount(new BigDecimal("120.00"));
            electricity.setGroup(aptGroup);
            electricity.setPaidBy(user1);
            electricity.setSplitType(SplitType.EQUAL);

            Split eSplit1 = Split.builder().user(user1).expense(electricity).amount(new BigDecimal(AMOUNT_60)).build();
            Split eSplit2 = Split.builder().user(user2).expense(electricity).amount(new BigDecimal(AMOUNT_60)).build();
            electricity.getSplits().add(eSplit1);
            electricity.getSplits().add(eSplit2);
            expenseRepository.save(electricity);

            // Expense 9: Shared Snacks (Apartment 4B) paid by testuser, but testuser is not in aptGroup?
            // Wait, testuser (user0) is NOT in aptGroup. Let's add them.
            aptGroup.getMembers().add(user0);
            groupRepository.save(aptGroup);

            Expense snacks = new Expense();
            snacks.setDescription("Shared Snacks");
            snacks.setCategory("Food");
            snacks.setAmount(new BigDecimal("30.00"));
            snacks.setGroup(aptGroup);
            snacks.setPaidBy(user0);
            snacks.setSplitType(SplitType.EQUAL);

            Split sSplit1 = Split.builder().user(user0).expense(snacks).amount(new BigDecimal(AMOUNT_10)).build();
            Split sSplit2 = Split.builder().user(user1).expense(snacks).amount(new BigDecimal(AMOUNT_10)).build();
            Split sSplit3 = Split.builder().user(user2).expense(snacks).amount(new BigDecimal(AMOUNT_10)).build();
            snacks.getSplits().add(sSplit1);
            snacks.getSplits().add(sSplit2);
            snacks.getSplits().add(sSplit3);
            expenseRepository.save(snacks);

            // Additional transactions
            Transaction t4 = Objects.requireNonNull(Transaction.builder()
                    .group(aptGroup)
                    .fromUser(user1)
                    .toUser(user0)
                    .amount(new BigDecimal(AMOUNT_10))
                    .note("Snack money")
                    .status(TransactionStatus.SETTLED)
                    .occurredAt(java.time.OffsetDateTime.now())
                    .build());
            transactionRepository.save(t4);
        }
    }
}
