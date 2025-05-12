package com.skillshare.controller;

import com.skillshare.model.LearningProgress;
import com.skillshare.model.User;
import com.skillshare.repository.mongo.LearningProgressRepository;
import com.skillshare.repository.mongo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learning-progress")
public class LearningProgressController {

    @Autowired
    private LearningProgressRepository learningProgressRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createProgress(@RequestBody LearningProgress progress, @AuthenticationPrincipal User user) {
        progress.setUser(user);
        progress.onCreate();
        return ResponseEntity.ok(learningProgressRepository.save(progress));
    }

    @GetMapping
    public ResponseEntity<?> getProgress(@AuthenticationPrincipal User user, Pageable pageable) {
        Page<LearningProgress> progress = learningProgressRepository.findByUser(user, pageable);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProgressById(@PathVariable String id, @AuthenticationPrincipal User user) {
        return learningProgressRepository.findById(id)
                .map(progress -> {
                    if (!progress.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to view this progress");
                    }
                    return ResponseEntity.ok(progress);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgress(@PathVariable String id, @RequestBody LearningProgress updatedProgress, @AuthenticationPrincipal User user) {
        return learningProgressRepository.findById(id)
                .map(progress -> {
                    if (!progress.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to update this progress");
                    }
                    progress.setTitle(updatedProgress.getTitle());
                    progress.setDescription(updatedProgress.getDescription());
                    progress.setProgress(updatedProgress.getProgress());
                    progress.onUpdate();
                    return ResponseEntity.ok(learningProgressRepository.save(progress));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgress(@PathVariable String id, @AuthenticationPrincipal User user) {
        return learningProgressRepository.findById(id)
                .map(progress -> {
                    if (!progress.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to delete this progress");
                    }
                    learningProgressRepository.delete(progress);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 