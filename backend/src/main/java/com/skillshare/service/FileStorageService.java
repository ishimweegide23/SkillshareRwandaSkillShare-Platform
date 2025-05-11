package com.skillshare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public FileStorageService() {
        // Default constructor
    }

    public String storeFile(MultipartFile file, String type) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, type);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate a unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + fileExtension;

        // Save the file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return the relative URL
        return "/uploads/" + type + "/" + filename;
    }

    public void deleteFile(String fileUrl) throws IOException {
        // Extract the file path from the URL
        String filePath = fileUrl.replace("/uploads/", "");
        Path path = Paths.get(uploadDir, filePath);
        
        // Delete the file if it exists
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }
} 