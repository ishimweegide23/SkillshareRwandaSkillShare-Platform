package com.skillshare.repository.mongo;

import com.skillshare.model.Comment;
import com.skillshare.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByPost(Post post);
} 