package com.skillshare.controller;

import com.skillshare.model.FeedPost;
import com.skillshare.model.FeedComment;
import com.skillshare.repository.mongo.FeedPostRepository;
import com.skillshare.repository.mongo.FeedCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedController {

    @Autowired
    private FeedPostRepository feedPostRepository;

    @Autowired
    private FeedCommentRepository feedCommentRepository;

    // Get all posts
    @GetMapping
    public ResponseEntity<List<FeedPost>> getAllPosts() {
        return ResponseEntity.ok(feedPostRepository.findAll());
    }

    // Get posts by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<FeedPost>> getPostsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(feedPostRepository.findByCategory(category));
    }

    // Get posts by source type
    @GetMapping("/source/{sourceType}")
    public ResponseEntity<List<FeedPost>> getPostsBySourceType(@PathVariable String sourceType) {
        return ResponseEntity.ok(feedPostRepository.findBySourceType(sourceType));
    }

    // Get posts by category and source type
    @GetMapping("/category/{category}/source/{sourceType}")
    public ResponseEntity<List<FeedPost>> getPostsByCategoryAndSourceType(
            @PathVariable String category,
            @PathVariable String sourceType) {
        return ResponseEntity.ok(feedPostRepository.findByCategoryAndSourceType(category, sourceType));
    }

    // Create a new post
    @PostMapping
    public ResponseEntity<FeedPost> createPost(@RequestBody FeedPost post) {
        return ResponseEntity.ok(feedPostRepository.save(post));
    }

    // Update a post
    @PutMapping("/{id}")
    public ResponseEntity<FeedPost> updatePost(@PathVariable String id, @RequestBody FeedPost post) {
        Optional<FeedPost> existingPost = feedPostRepository.findById(id);
        if (existingPost.isPresent()) {
            post.setId(id);
            return ResponseEntity.ok(feedPostRepository.save(post));
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        Optional<FeedPost> post = feedPostRepository.findById(id);
        if (post.isPresent()) {
            // Delete all comments for this post
            feedCommentRepository.deleteAll(feedCommentRepository.findByPostId(id));
            // Delete the post
            feedPostRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Like a post
    @PostMapping("/{id}/like")
    public ResponseEntity<FeedPost> likePost(@PathVariable String id) {
        Optional<FeedPost> post = feedPostRepository.findById(id);
        if (post.isPresent()) {
            FeedPost updatedPost = post.get();
            updatedPost.setLikes(updatedPost.getLikes() + 1);
            return ResponseEntity.ok(feedPostRepository.save(updatedPost));
        }
        return ResponseEntity.notFound().build();
    }

    // Get comments for a post
    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<FeedComment>> getComments(@PathVariable String postId) {
        return ResponseEntity.ok(feedCommentRepository.findByPostId(postId));
    }

    // Add a comment
    @PostMapping("/{postId}/comments")
    public ResponseEntity<FeedComment> addComment(
            @PathVariable String postId,
            @RequestBody FeedComment comment) {
        comment.setPostId(postId);
        return ResponseEntity.ok(feedCommentRepository.save(comment));
    }

    // Update a comment
    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<FeedComment> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody FeedComment comment) {
        Optional<FeedComment> existingComment = feedCommentRepository.findById(commentId);
        if (existingComment.isPresent() && existingComment.get().getPostId().equals(postId)) {
            comment.setId(commentId);
            comment.setPostId(postId);
            return ResponseEntity.ok(feedCommentRepository.save(comment));
        }
        return ResponseEntity.notFound().build();
    }

    // Delete a comment
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId) {
        Optional<FeedComment> comment = feedCommentRepository.findById(commentId);
        if (comment.isPresent() && comment.get().getPostId().equals(postId)) {
            feedCommentRepository.deleteById(commentId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
} 