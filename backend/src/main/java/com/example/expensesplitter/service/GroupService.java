package com.example.expensesplitter.service;

import com.example.expensesplitter.dto.GroupDto;
import com.example.expensesplitter.dto.GroupRequest;
import com.example.expensesplitter.dto.UserDto;
import com.example.expensesplitter.entity.Group;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.GroupRepository;
import com.example.expensesplitter.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupService(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    @SuppressWarnings("java:S2259")
    public Group createGroup(GroupRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<User> members = new HashSet<>();
        members.add(creator);

        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                if (memberId == null) {
                    continue;
                }
                Objects.requireNonNull(memberId);
                if (!memberId.equals(creator.getId())) {
                    userRepository.findById(memberId).ifPresent(members::add);
                }
            }
        }

        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(creator)
                .members(members)
                .build();

        return groupRepository.save(Objects.requireNonNull(group));
    }

    public List<Group> getUserGroups(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return groupRepository.findByMembers_Id(user.getId());
    }

    public Group getGroupById(Long id) {
        return groupRepository.findByIdWithMembers(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    public Group updateGroup(Long id, GroupRequest request, String username) {
        Group group = getGroupById(id);

        if (!group.getCreatedBy().getUsername().equals(username)) {
            throw new IllegalArgumentException("Only creator can update group");
        }

        group.setName(request.getName());
        group.setDescription(request.getDescription());

        Set<User> members = new HashSet<>();
        members.add(group.getCreatedBy());

        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                if (memberId == null) {
                    continue;
                }
                Objects.requireNonNull(memberId);
                if (!memberId.equals(group.getCreatedBy().getId())) {
                    userRepository.findById(memberId).ifPresent(members::add);
                }
            }
        }

        group.setMembers(members);

        return groupRepository.save(Objects.requireNonNull(group));
    }

    public void deleteGroup(Long id, String username) {
        Group group = getGroupById(id);

        if (!group.getCreatedBy().getUsername().equals(username)) {
            throw new IllegalArgumentException("Only creator can delete group");
        }

        groupRepository.delete(group);
    }
    
    @SuppressWarnings("java:S2259")
    public Group addMembers(Long groupId, Set<Long> memberIds) {
        Group group = getGroupById(groupId);
        if (memberIds != null) {
            for (Long memberId : memberIds) {
                if (memberId == null) {
                    continue;
                }
                Objects.requireNonNull(memberId);
                if (!memberId.equals(group.getCreatedBy().getId())) {
                    userRepository.findById(memberId).ifPresent(group.getMembers()::add);
                }
            }
        }
        return groupRepository.save(Objects.requireNonNull(group));
    }

    private GroupDto convertToDto(Group group) {
        List<UserDto> memberDtos = group.getMembers().stream()
                .map(user -> new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getPhoneNumber()))
                .toList();
        return new GroupDto(group.getId(), group.getName(), group.getDescription(),
                           group.getCreatedBy().getId(), memberDtos);
    }

    public GroupDto createGroupDto(GroupRequest request, String username) {
        Group group = createGroup(request, username);
        return convertToDto(group);
    }

    public List<GroupDto> getUserGroupDtos(String username) {
        List<Group> groups = getUserGroups(username);
        return groups.stream().map(this::convertToDto).toList();
    }

    public GroupDto getGroupDtoById(Long id) {
        Group group = getGroupById(id);
        return convertToDto(group);
    }

    public GroupDto updateGroupDto(Long id, GroupRequest request, String username) {
        Group group = updateGroup(id, request, username);
        return convertToDto(group);
    }
}
