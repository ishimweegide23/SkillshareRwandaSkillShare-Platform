package com.skillshare.repository.mongo;

import com.skillshare.model.FeedPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedPostRepository extends MongoRepository<FeedPost, String> {
    List<FeedPost> findByCategory(String category);
    List<FeedPost> findBySourceType(String sourceType);
    List<FeedPost> findByCategoryAndSourceType(String category, String sourceType);
} 