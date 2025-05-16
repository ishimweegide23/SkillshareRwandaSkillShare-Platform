package com.skillshare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feed_posts")
public class FeedPost {
    @Id
    private String id;
    private String title;
    private String content;
    private String category;  // IT, Music, Beauty, Programming, etc.
    private String sourceId;  // ID of the original post from its category
    private String sourceType; // Type of the source (e.g., "learning_plan", "post")
    private int likes;
    private List<FeedComment> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.likes = 0;
        this.comments = List.of();
    }

    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 