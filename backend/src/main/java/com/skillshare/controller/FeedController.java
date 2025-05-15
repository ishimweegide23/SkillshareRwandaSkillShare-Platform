package com.skillshare.controller;

import com.skillshare.model.Feed;
import com.skillshare.repository.mongo.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FeedController {

    private final FeedRepository feedRepository;

    @PostMapping
    public ResponseEntity<Feed> createFeed(@RequestBody Feed feed) {
        feed.onCreate();
        return ResponseEntity.ok(feedRepository.save(feed));
    }

    @GetMapping
    public ResponseEntity<List<Feed>> getAllFeeds() {
        return ResponseEntity.ok(feedRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feed> getFeedById(@PathVariable String id) {
        return feedRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feed> updateFeed(@PathVariable String id, @RequestBody Feed updatedFeed) {
        return feedRepository.findById(id)
                .map(existingFeed -> {
                    existingFeed.setTitle(updatedFeed.getTitle());
                    existingFeed.setContent(updatedFeed.getContent());
                    existingFeed.onUpdate();
                    return ResponseEntity.ok(feedRepository.save(existingFeed));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeed(@PathVariable String id) {
        return feedRepository.findById(id)
                .map(feed -> {
                    feedRepository.delete(feed);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 