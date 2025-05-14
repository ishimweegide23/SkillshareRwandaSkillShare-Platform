package com.skillshare.repository.mongo;

import com.skillshare.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface PostRepository extends MongoRepository<Post, String> {
    
    @Query(value = "{}", sort = "{ 'createdAt' : -1 }")
    Page<Post> findAllOrderByCreatedAtDesc(Pageable pageable);
} 