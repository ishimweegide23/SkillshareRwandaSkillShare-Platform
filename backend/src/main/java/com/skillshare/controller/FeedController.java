package com.skillshare.controller;

import com.skillshare.model.Feed;
import com.skillshare.model.Post;
import com.skillshare.model.User;
import com.skillshare.repository.mongo.FeedRepository;
import com.skillshare.repository.mongo.PostRepository;
import com.skillshare.repository.mongo.UserRepository;
import com.skillshare.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedRepository feedRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<?> createFeed(@RequestBody Feed feed, @AuthenticationPrincipal User user) {
        if (feedRepository.existsByNameAndUser(feed.getName(), user)) {
            return ResponseEntity.badRequest().body("Feed with this name already exists");
        }
        feed.setName(feed.getName());
        feed.setDescription(feed.getDescription());
        feed.setUser(user);
        feed.onCreate();
        return ResponseEntity.ok(feedRepository.save(feed));
    }

    @GetMapping
    public ResponseEntity<?> getFeeds(@AuthenticationPrincipal User user, Pageable pageable) {
        Page<Feed> feeds = feedRepository.findByUser(user, pageable);
        return ResponseEntity.ok(feeds);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedById(@PathVariable String id, @AuthenticationPrincipal User user) {
        return feedRepository.findById(id)
                .map(feed -> {
                    if (!feed.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to view this feed");
                    }
                    return ResponseEntity.ok(feed);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFeed(@PathVariable String id, @RequestBody Feed updatedFeed, @AuthenticationPrincipal User user) {
        return feedRepository.findById(id)
                .map(feed -> {
                    if (!feed.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to update this feed");
                    }
                    if (!feed.getName().equals(updatedFeed.getName()) && 
                        feedRepository.existsByNameAndUser(updatedFeed.getName(), user)) {
                        return ResponseEntity.badRequest().body("Feed with this name already exists");
                    }
                    feed.setName(updatedFeed.getName());
                    feed.setDescription(updatedFeed.getDescription());
                    feed.onUpdate();
                    return ResponseEntity.ok(feedRepository.save(feed));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeed(@PathVariable String id, @AuthenticationPrincipal User user) {
        return feedRepository.findById(id)
                .map(feed -> {
                    if (!feed.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to delete this feed");
                    }
                    feedRepository.delete(feed);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/posts/{postId}")
    public ResponseEntity<?> addPostToFeed(@PathVariable String id, @PathVariable String postId, @AuthenticationPrincipal User user) {
        return feedRepository.findById(id)
                .map(feed -> {
                    if (!feed.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to modify this feed");
                    }
                    return postRepository.findById(postId)
                            .map(post -> {
                                feed.getPosts().add(post);
                                feed.onUpdate();
                                return ResponseEntity.ok(feedRepository.save(feed));
                            })
                            .orElse(ResponseEntity.notFound().build());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/posts/{postId}")
    public ResponseEntity<?> removePostFromFeed(@PathVariable String id, @PathVariable String postId, @AuthenticationPrincipal User user) {
        return feedRepository.findById(id)
                .map(feed -> {
                    if (!feed.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to modify this feed");
                    }
                    return postRepository.findById(postId)
                            .map(post -> {
                                feed.getPosts().remove(post);
                                feed.onUpdate();
                                return ResponseEntity.ok(feedRepository.save(feed));
                            })
                            .orElse(ResponseEntity.notFound().build());
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 