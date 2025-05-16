package com.skillshare.controller;

import com.skillshare.model.Comment;
import com.skillshare.model.Post;
import com.skillshare.model.User;
import com.skillshare.repository.mongo.CommentRepository;
import com.skillshare.repository.mongo.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @PostMapping("/posts/{postId}")
    public ResponseEntity<?> createComment(@PathVariable String postId, @RequestBody Comment comment, @AuthenticationPrincipal User user) {
        return postRepository.findById(postId)
                .map(post -> {
                    comment.setUser(user);
                    comment.setPost(post);
                    comment.onCreate();
                    return ResponseEntity.ok(commentRepository.save(comment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<?> getCommentsByPost(@PathVariable String postId) {
        return postRepository.findById(postId)
                .map(post -> {
                    List<Comment> comments = commentRepository.findByPost(post);
                    return ResponseEntity.ok(comments);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable String id, @RequestBody Comment updatedComment, @AuthenticationPrincipal User user) {
        return commentRepository.findById(id)
                .map(comment -> {
                    if (comment.getUser() != null && user != null && !comment.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to update this comment");
                    }
                    comment.setContent(updatedComment.getContent());
                    comment.onUpdate();
                    return ResponseEntity.ok(commentRepository.save(comment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id, @AuthenticationPrincipal User user) {
        return commentRepository.findById(id)
                .map(comment -> {
                    if (comment.getUser() != null && user != null && !comment.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to delete this comment");
                    }
                    commentRepository.delete(comment);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 