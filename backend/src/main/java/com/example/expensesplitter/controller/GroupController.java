package com.example.expensesplitter.controller;

import com.example.expensesplitter.dto.GroupDto;
import com.example.expensesplitter.dto.GroupRequest;
import com.example.expensesplitter.service.DebtSimplificationService;
import com.example.expensesplitter.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;
    private final DebtSimplificationService debtSimplificationService;

    public GroupController(GroupService groupService, DebtSimplificationService debtSimplificationService) {
        this.groupService = groupService;
        this.debtSimplificationService = debtSimplificationService;
    }

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(@RequestBody GroupRequest request, Authentication authentication) {
        GroupDto group = groupService.createGroupDto(request, authentication.getName());
        return ResponseEntity.ok(group);
    }

    @GetMapping
    public ResponseEntity<List<GroupDto>> getUserGroups(Authentication authentication) {
        List<GroupDto> groups = groupService.getUserGroupDtos(authentication.getName());
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDto> getGroupById(@PathVariable Long id) {
        GroupDto group = groupService.getGroupDtoById(id);
        return ResponseEntity.ok(group);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDto> updateGroup(@PathVariable Long id, @RequestBody GroupRequest request, Authentication authentication) {
        GroupDto group = groupService.updateGroupDto(id, request, authentication.getName());
        return ResponseEntity.ok(group);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id, Authentication authentication) {
        groupService.deleteGroup(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/settlements")
    public ResponseEntity<Object> getSettlements(@PathVariable Long id) {
        return ResponseEntity.ok(debtSimplificationService.simplifyDebts(id));
    }
}
