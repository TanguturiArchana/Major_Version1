package com.osi.shramsaathi.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.osi.shramsaathi.model.ChatMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    // Receives messages sent to /app/chat and broadcasts to /topic/chat/{applicationId}
    @MessageMapping("/chat")
    public void handleChatMessage(ChatMessage message) {
        if (message == null || message.getApplicationId() == null) return;
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + message.getApplicationId(), message);
        } catch (Exception e) {
            // log and ignore
            log.error("Failed to broadcast chat message", e);
        }
    }
}
