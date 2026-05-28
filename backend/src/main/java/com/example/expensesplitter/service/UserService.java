package com.example.expensesplitter.service;

import com.example.expensesplitter.dto.CreateUserRequest;
import com.example.expensesplitter.dto.LoginRequest;
import com.example.expensesplitter.dto.UserDto;
import com.example.expensesplitter.entity.User;
import com.example.expensesplitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public UserDto createUser(CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(hashPassword(request.getPassword()));
        return toDto(userRepository.save(user));
    }

    public UserDto authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new com.example.expensesplitter.exception.ResourceNotFoundException("User not found: " + request.getUsername()));
        if (!user.getPassword().equals(hashPassword(request.getPassword()))) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        return toDto(user);
    }

    public User getUserById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return userRepository.findById(id)
                .orElseThrow(() -> new com.example.expensesplitter.exception.ResourceNotFoundException("User not found: " + id));
    }

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getPhoneNumber());
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
