package com.example.expensesplitter.controller;

import com.example.expensesplitter.service.AIAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    @Autowired
    private AIAssistantService aiAssistantService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request, Authentication authentication) {
        String userMessage = request.get("message");
        String username = authentication.getName();

        String response = aiAssistantService.processMessage(userMessage, username);

        return ResponseEntity.ok(Map.of("response", response));
    }
}