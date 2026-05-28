package com.example.expensesplitter.controller;

import com.example.expensesplitter.dto.TestEmailRequest;
import com.example.expensesplitter.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/reminders")
    public ResponseEntity<Map<String, String>> sendReminders(Authentication authentication) {
        notificationService.sendRemindersForUser(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Reminders sent successfully"));
    }

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestBody TestEmailRequest request) {
        notificationService.sendTestEmail(request.getEmail(), request.getMessage());
        return ResponseEntity.ok(Map.of("message", "Test email send requested"));
    }
}
