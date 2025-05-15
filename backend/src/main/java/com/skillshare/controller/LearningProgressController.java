package com.skillshare.controller;

import com.skillshare.model.LearningProgress;
import com.skillshare.repository.mongo.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-progress")
@CrossOrigin(origins = "http://localhost:5173")
public class LearningProgressController {

    @Autowired
    private LearningProgressRepository learningProgressRepository;

    @PostMapping
    public ResponseEntity<LearningProgress> createProgress(@RequestBody LearningProgress progress) {
        progress.onCreate();
        return ResponseEntity.ok(learningProgressRepository.save(progress));
    }

    @GetMapping
    public ResponseEntity<List<LearningProgress>> getProgress() {
        List<LearningProgress> progressList = learningProgressRepository.findAll();
        return ResponseEntity.ok(progressList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningProgress> getProgressById(@PathVariable String id) {
        return learningProgressRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningProgress> updateProgress(@PathVariable String id, @RequestBody LearningProgress updatedProgress) {
        return learningProgressRepository.findById(id)
                .map(existingProgress -> {
                    existingProgress.setTitle(updatedProgress.getTitle());
                    existingProgress.setDescription(updatedProgress.getDescription());
                    existingProgress.setStatus(updatedProgress.getStatus());
                    existingProgress.setDate(updatedProgress.getDate());
                    existingProgress.setDuration(updatedProgress.getDuration());
                    existingProgress.onUpdate();
                    return ResponseEntity.ok(learningProgressRepository.save(existingProgress));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable String id) {
        return learningProgressRepository.findById(id)
                .map(progress -> {
                    learningProgressRepository.delete(progress);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 