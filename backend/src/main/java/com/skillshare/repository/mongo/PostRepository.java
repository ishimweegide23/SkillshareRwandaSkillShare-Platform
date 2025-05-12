package com.skillshare.repository.mongo;

import com.skillshare.model.Post;
import com.skillshare.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    @Query(value = "{ 'user': { $in: ?0 } }", sort = "{ 'createdAt': -1 }")
    Page<Post> findByUserInOrderByCreatedAtDesc(Set<User> users, Pageable pageable);
    
    @Query(value = "{ 'user': ?0 }", sort = "{ 'createdAt': -1 }")
    Page<Post> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Post> findByUser(User user);
} 