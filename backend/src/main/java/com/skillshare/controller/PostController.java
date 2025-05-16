package com.skillshare.controller;

import com.skillshare.model.Post;
import com.skillshare.repository.mongo.PostRepository;
import com.skillshare.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;

    // Create a new post
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        try {
            post.onCreate();
            Post savedPost = postRepository.save(post);
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            System.err.println("Error creating post: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to create post: " + e.getMessage());
        }
    }
    
    // Create a post with images
    @PostMapping("/with-images")
    public ResponseEntity<?> createPostWithImages(
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        
        try {
            Post post = new Post();
            post.setDescription(description != null ? description : "");
            
            if (files != null && !files.isEmpty()) {
                List<String> imageUrls = files.stream()
                    .map(file -> {
                        try {
                            return fileStorageService.storeFile(file, "posts");
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to store file: " + e.getMessage());
                        }
                    })
                    .collect(Collectors.toList());
                
                post.setImageUrls(imageUrls);
            }
            
            post.onCreate();
            Post savedPost = postRepository.save(post);
            return ResponseEntity.ok(savedPost);
            
        } catch (Exception e) {
            System.err.println("Error creating post with images: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to create post: " + e.getMessage());
        }
    }

    // Get all posts with pagination
    @GetMapping
    public ResponseEntity<?> getAllPosts(Pageable pageable) {
        try {
            Page<Post> posts = postRepository.findAllOrderByCreatedAtDesc(pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            System.err.println("Error fetching posts: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to fetch posts: " + e.getMessage());
        }
    }

    // Get a single post by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable String id) {
        try {
            return postRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error fetching post: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to fetch post: " + e.getMessage());
        }
    }

    // Update a post
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        
        try {
            return postRepository.findById(id)
                    .map(post -> {
                        if (description != null) {
                            post.setDescription(description);
                        }
                        
                        if (files != null && !files.isEmpty()) {
                            try {
                                List<String> newImageUrls = files.stream()
                                    .map(file -> {
                                        try {
                                            return fileStorageService.storeFile(file, "posts");
                                        } catch (IOException e) {
                                            throw new RuntimeException("Failed to store file: " + e.getMessage());
                                        }
                                    })
                                    .collect(Collectors.toList());
                                
                                List<String> allImageUrls = new ArrayList<>();
                                if (post.getImageUrls() != null) {
                                    allImageUrls.addAll(post.getImageUrls());
                                }
                                allImageUrls.addAll(newImageUrls);
                                
                                post.setImageUrls(allImageUrls);
                            } catch (Exception e) {
                                return ResponseEntity.badRequest().body("Failed to process images: " + e.getMessage());
                            }
                        }
                        
                        post.onUpdate();
                        return ResponseEntity.ok(postRepository.save(post));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error updating post: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update post: " + e.getMessage());
        }
    }

    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        try {
            return postRepository.findById(id)
                    .map(post -> {
                        // Delete associated images
                        if (post.getImageUrls() != null) {
                            post.getImageUrls().forEach(imageUrl -> {
                                try {
                                    fileStorageService.deleteFile(imageUrl);
                                } catch (IOException e) {
                                    System.err.println("Failed to delete image: " + imageUrl + ", error: " + e.getMessage());
                                }
                            });
                        }
                        
                        postRepository.delete(post);
                        return ResponseEntity.ok().build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error deleting post: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to delete post: " + e.getMessage());
        }
    }

    // Delete an image from a post
    @DeleteMapping("/{postId}/images/{imageUrl}")
    public ResponseEntity<?> deleteImageFromPost(
            @PathVariable String postId,
            @PathVariable String imageUrl) {
        
        try {
            return postRepository.findById(postId)
                    .map(post -> {
                        if (post.getImageUrls() == null || !post.getImageUrls().remove(imageUrl)) {
                            return ResponseEntity.badRequest().body("Image not found in the post");
                        }
                        
                        try {
                            fileStorageService.deleteFile(imageUrl);
                        } catch (IOException e) {
                            System.err.println("Failed to delete image: " + e.getMessage());
                        }
                        
                        post.onUpdate();
                        return ResponseEntity.ok(postRepository.save(post));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error deleting image: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to delete image: " + e.getMessage());
        }
    }

    // Like a post
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable String id) {
        return postRepository.findById(id)
            .map(post -> {
                post.setLikes(post.getLikes() + 1);
                postRepository.save(post);
                return ResponseEntity.ok(post);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Unlike a post
    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(@PathVariable String id) {
        return postRepository.findById(id)
            .map(post -> {
                post.setLikes(Math.max(0, post.getLikes() - 1));
                postRepository.save(post);
                return ResponseEntity.ok(post);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}