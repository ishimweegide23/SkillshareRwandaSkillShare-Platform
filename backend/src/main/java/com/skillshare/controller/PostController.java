package com.skillshare.controller;

import com.skillshare.model.Post;
import com.skillshare.model.User;
import com.skillshare.repository.mongo.PostRepository;
import com.skillshare.repository.mongo.UserRepository;
import com.skillshare.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    /**
     * Create a new post (CREATE)
     */
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post, @AuthenticationPrincipal User user) {
        post.setUser(user);
        post.onCreate();
        return ResponseEntity.ok(postRepository.save(post));
    }
    
    /**
     * Create a new post with images (CREATE with images)
     */
    @PostMapping("/with-images")
    public ResponseEntity<?> createPostWithImages(
            @RequestParam("description") String description,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal User user) {
        
        Post post = new Post();
        post.setDescription(description);
        post.setUser(user);
        
        // Handle image uploads if provided
        if (files != null && !files.isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            
            for (MultipartFile file : files) {
                try {
                    String fileUrl = fileStorageService.storeFile(file, "image");
                    imageUrls.add(fileUrl);
                } catch (IOException e) {
                    return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
                }
            }
            
            post.setImageUrls(imageUrls);
        }
        
        post.onCreate();
        return ResponseEntity.ok(postRepository.save(post));
    }

    /**
     * Get the user's feed (READ)
     */
    @GetMapping("/feed")
    public ResponseEntity<?> getFeed(@AuthenticationPrincipal User user, Pageable pageable) {
        Page<Post> posts = postRepository.findByUserInOrderByCreatedAtDesc(user.getFollowing(), pageable);
        return ResponseEntity.ok(posts);
    }
    
    /**
     * Get the user's own posts (READ)
     */
    @GetMapping
    public ResponseEntity<?> getPosts(@AuthenticationPrincipal User user, Pageable pageable) {
        Page<Post> posts = postRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get a specific post (READ)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable String id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update a post (UPDATE)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestBody Post updatedPost, @AuthenticationPrincipal User user) {
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to update this post");
                    }
                    post.setDescription(updatedPost.getDescription());
                    post.setUser(user);
                    post.onUpdate();
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update a post with new images (UPDATE with images)
     */
    @PostMapping("/{id}/images")
    public ResponseEntity<?> addImages(@PathVariable String id, @RequestParam("files") List<MultipartFile> files, @AuthenticationPrincipal User user) {
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to modify this post");
                    }
                    // TODO: Implement image upload logic
                    post.setImageUrls(List.of("image1.jpg", "image2.jpg")); // Placeholder
                    post.onUpdate();
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete a post (DELETE)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id, @AuthenticationPrincipal User user) {
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to delete this post");
                    }
                    postRepository.delete(post);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete a specific image from a post
     */
    @DeleteMapping("/{postId}/images/{imageUrl}")
    public ResponseEntity<?> deleteImageFromPost(
            @PathVariable String postId,
            @PathVariable String imageUrl,
            @AuthenticationPrincipal User user) {
        
        return postRepository.findById(postId)
                .map(post -> {
                    if (!post.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.badRequest().body("Not authorized to modify this post");
                    }
                    
                    // Remove the image URL from the post
                    boolean removed = post.getImageUrls().remove(imageUrl);
                    
                    if (!removed) {
                        return ResponseEntity.badRequest().body("Image not found in the post");
                    }
                    
                    // Try to delete the file from storage
                    try {
                        fileStorageService.deleteFile(imageUrl);
                    } catch (IOException e) {
                        // Log the error but don't fail the request
                        System.err.println("Failed to delete file: " + e.getMessage());
                    }
                    
                    post.onUpdate();
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Like a post
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable String id, @AuthenticationPrincipal User user) {
        return postRepository.findById(id)
                .map(post -> {
                    if (post.getLikedBy().contains(user)) {
                        return ResponseEntity.badRequest().body("Post already liked");
                    }
                    post.getLikedBy().add(user);
                    post.onUpdate();
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Unlike a post
     */
    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(@PathVariable String id, @AuthenticationPrincipal User user) {
        return postRepository.findById(id)
                .map(post -> {
                    if (!post.getLikedBy().contains(user)) {
                        return ResponseEntity.badRequest().body("Post not liked");
                    }
                    post.getLikedBy().remove(user);
                    post.onUpdate();
                    return ResponseEntity.ok(postRepository.save(post));
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 