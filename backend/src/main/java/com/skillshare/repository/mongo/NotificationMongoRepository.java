package com.skillshare.repository.mongo;

import com.skillshare.model.Notification;
import com.skillshare.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationMongoRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
} 