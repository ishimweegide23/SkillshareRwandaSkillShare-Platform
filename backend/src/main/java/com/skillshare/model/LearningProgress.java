package com.skillshare.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "learning_progress")
public class LearningProgress {
    @Id
    private String id;
    private String title;
    private String description;
    private String status;
    private LocalDate date;
    private Integer duration;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    @DBRef
    private User user;

    public void onCreate() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }

    public void onUpdate() {
        this.updatedAt = LocalDate.now();
    }
} 