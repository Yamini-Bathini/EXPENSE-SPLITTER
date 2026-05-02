package com.example.expensesplitter.controller;

import com.example.expensesplitter.dto.CreateUserRequest;
import com.example.expensesplitter.dto.LoginRequest;
import com.example.expensesplitter.dto.UserDto;
import com.example.expensesplitter.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public List<UserDto> listUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PostMapping("/login")
    public UserDto login(@Valid @RequestBody LoginRequest request) {
        return userService.authenticate(request);
    }
}

