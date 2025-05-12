# Skillshare API Postman Collection

This directory contains Postman collection and environment files for testing the Skillshare API endpoints.

## Files

- `Skillshare_API.postman_collection.json`: Contains all API requests organized by resource type
- `Skillshare_API.postman_environment.json`: Contains environment variables used in the collection

## Setup Instructions

1. Import both files into Postman:
   - Click "Import" in Postman
   - Select both JSON files from this directory

2. Set up the environment:
   - Click on the "Environments" tab
   - Select "Skillshare API Environment"
   - The `baseUrl` is pre-configured to `http://localhost:8080`
   - The `token` variable will be automatically populated after successful login

## Using the Collection

1. Authentication:
   - Start with the "Register" request to create a new account
   - Use the "Login" request to obtain an authentication token
   - The token will be automatically saved to the environment variable

2. Users:
   - "Get Profile" retrieves the current user's profile
   - "Update Profile" allows updating user information

3. Posts (Feed):
   - "Create Post" creates a new post with text
   - "Create Post with Images" creates a new post with text and images
   - "Get Feed" retrieves posts from users you follow
   - "Get My Posts" retrieves your own posts
   - "Get Specific Post" retrieves a single post by ID
   - "Update Post" allows updating a post's text content
   - "Update Post with Images" allows updating a post's text and adding new images
   - "Delete Post" removes a post
   - "Delete Image from Post" removes a specific image from a post
   - "Like Post" adds a like to a post
   - "Unlike Post" removes a like from a post

4. Custom Feeds:
   - "Create Feed" creates a new custom feed with a name and description
   - "Get All Feeds" retrieves all your custom feeds with pagination
   - "Get Specific Feed" retrieves a single custom feed by ID
   - "Update Feed" allows updating a feed's name and description
   - "Delete Feed" removes a custom feed
   - "Add Post to Feed" adds a post to a custom feed
   - "Remove Post from Feed" removes a post from a custom feed

5. Learning Plans:
   - "Create Learning Plan" creates a new learning plan
   - "Get Learning Plans" retrieves all learning plans

6. Files:
   - "Upload Image" handles image uploads for posts and profiles

## Notes

- All requests except Register and Login require authentication
- The Authorization header is automatically set using the environment token
- File uploads use form-data with the key "file"
- The base URL can be modified in the environment settings if needed
- When updating a post with images, you can add multiple files with the same key "files"
- For pagination, use the query parameters: page, size, and sort (e.g., ?page=0&size=10&sort=createdAt,desc)
- Custom feeds allow you to create collections of posts for different purposes
- Each user can create multiple custom feeds with different names and descriptions
- Posts can be added to or removed from custom feeds at any time 