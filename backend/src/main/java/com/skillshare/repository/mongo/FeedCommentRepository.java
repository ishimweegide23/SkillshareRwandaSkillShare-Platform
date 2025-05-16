package com.skillshare.repository.mongo;

import com.skillshare.model.FeedComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedCommentRepository extends MongoRepository<FeedComment, String> {
    List<FeedComment> findByPostId(String postId);
} 