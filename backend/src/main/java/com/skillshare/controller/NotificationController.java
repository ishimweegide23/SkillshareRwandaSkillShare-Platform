package com.skillshare.controller;

import com.skillshare.model.Notification;
import com.skillshare.model.User;
import com.skillshare.repository.mongo.NotificationMongoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationMongoRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id, @AuthenticationPrincipal User user) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    if (!notification.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to modify this notification");
                    }
                    notification.setRead(true);
                    notification.onUpdate();
                    return ResponseEntity.ok(notificationRepository.save(notification));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id, @AuthenticationPrincipal User user) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    if (!notification.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to delete this notification");
                    }
                    notificationRepository.delete(notification);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 