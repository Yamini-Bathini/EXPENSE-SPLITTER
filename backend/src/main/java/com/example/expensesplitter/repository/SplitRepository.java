package com.example.expensesplitter.repository;

import com.example.expensesplitter.entity.Split;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SplitRepository extends JpaRepository<Split, Long> {
}
