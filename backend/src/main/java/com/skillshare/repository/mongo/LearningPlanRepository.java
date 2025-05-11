package com.skillshare.repository.mongo;

import com.skillshare.model.LearningPlan;
import com.skillshare.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    Page<LearningPlan> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
} 