package com.skillshare.controller;

import com.skillshare.model.User;
import com.skillshare.repository.mongo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@RequestBody User updatedUser) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(updatedUser.getName());
        user.setBio(updatedUser.getBio());
        user.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
        user.onUpdate();
        
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<?> followUser(@PathVariable String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User userToFollow = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));
        
        currentUser.getFollowing().add(userToFollow);
        currentUser.onUpdate();
        userRepository.save(currentUser);
        
        return ResponseEntity.ok("Successfully followed user");
    }

    @DeleteMapping("/follow/{userId}")
    public ResponseEntity<?> unfollowUser(@PathVariable String userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User userToUnfollow = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to unfollow not found"));
        
        currentUser.getFollowing().remove(userToUnfollow);
        currentUser.onUpdate();
        userRepository.save(currentUser);
        
        return ResponseEntity.ok("Successfully unfollowed user");
    }
} 