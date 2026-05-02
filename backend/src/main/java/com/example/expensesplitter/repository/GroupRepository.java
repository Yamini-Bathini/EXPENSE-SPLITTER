package com.example.expensesplitter.repository;

import com.example.expensesplitter.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    @Query("SELECT DISTINCT g FROM Group g JOIN FETCH g.members WHERE g.id IN (SELECT gm.id FROM Group gm JOIN gm.members m WHERE m.id = :userId)")
    List<Group> findByMembers_Id(Long userId);
    
    @Query("SELECT g FROM Group g JOIN FETCH g.members WHERE g.id = :id")
    java.util.Optional<Group> findByIdWithMembers(Long id);
}
