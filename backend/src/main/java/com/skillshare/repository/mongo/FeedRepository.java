package com.skillshare.repository.mongo;

import com.skillshare.model.Feed;
import com.skillshare.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedRepository extends MongoRepository<Feed, String> {
    Feed findByUser(User user);
    Page<Feed> findByUser(User user, Pageable pageable);
    
    @Query("{ 'name': ?0, 'user': ?1 }")
    boolean existsByNameAndUser(String name, User user);
} 