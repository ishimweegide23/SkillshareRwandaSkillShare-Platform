package com.skillshare.repository.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.skillshare.model.LearningProgress;
import com.skillshare.model.User;

@Repository
public interface LearningProgressRepository extends MongoRepository<LearningProgress, String> {
    Page<LearningProgress> findByUser(User user, Pageable pageable);
} 