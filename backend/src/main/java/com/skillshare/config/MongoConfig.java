package com.skillshare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.skillshare.repository.mongo")
@EnableMongoAuditing
public class MongoConfig {
    // MongoDB Atlas connection is configured in application.properties
    // spring.data.mongodb.uri=mongodb+srv://daviroxdj67:devinda1@cluster.lmm8oyf.mongodb.net/skillshare
} 