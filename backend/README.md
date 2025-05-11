# Skillshare Backend

A Spring Boot backend for the Skillshare application, which allows users to share and learn skills.

## Features

- User Authentication (OAuth2, JWT)
- User Profiles
- Skill Sharing Posts
- Learning Plans
- Learning Progress Updates
- Comments and Likes
- Notifications

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

## Getting Started

1. Clone the repository
2. Navigate to the project directory
3. Run the application using Maven:
   ```
   mvn spring-boot:run
   ```
4. The application will start on port 8081

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login a user
- GET `/api/auth/oauth2/success` - OAuth2 login success

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- POST `/api/users/follow/{userId}` - Follow a user
- DELETE `/api/users/follow/{userId}` - Unfollow a user

### Posts
- POST `/api/posts` - Create a post
- GET `/api/posts` - Get feed
- GET `/api/posts/{postId}` - Get a post
- PUT `/api/posts/{postId}` - Update a post
- DELETE `/api/posts/{postId}` - Delete a post
- POST `/api/posts/{postId}/like` - Like a post
- DELETE `/api/posts/{postId}/like` - Unlike a post

### Comments
- POST `/api/posts/{postId}/comments` - Add a comment
- GET `/api/posts/{postId}/comments` - Get comments
- PUT `/api/posts/{postId}/comments/{commentId}` - Update a comment
- DELETE `/api/posts/{postId}/comments/{commentId}` - Delete a comment

### Learning Plans
- POST `/api/learning-plans` - Create a learning plan
- GET `/api/learning-plans` - Get user learning plans
- GET `/api/learning-plans/{planId}` - Get a learning plan
- PUT `/api/learning-plans/{planId}` - Update a learning plan
- DELETE `/api/learning-plans/{planId}` - Delete a learning plan

### Learning Progress
- POST `/api/learning-progress` - Create a learning progress update
- GET `/api/learning-progress` - Get user learning progress
- GET `/api/learning-progress/{progressId}` - Get a learning progress update
- PUT `/api/learning-progress/{progressId}` - Update a learning progress update
- DELETE `/api/learning-progress/{progressId}` - Delete a learning progress update

### Notifications
- GET `/api/notifications` - Get user notifications
- GET `/api/notifications/unread/count` - Get unread notification count
- PUT `/api/notifications/{notificationId}/read` - Mark a notification as read
- PUT `/api/notifications/read/all` - Mark all notifications as read
- DELETE `/api/notifications/{notificationId}` - Delete a notification

### Files
- POST `/api/files/upload/image` - Upload an image
- POST `/api/files/upload/video` - Upload a video
- DELETE `/api/files` - Delete a file

## Testing with Postman

1. Import the Postman collection from the `postman` directory
2. Set up the environment variables:
   - `baseUrl`: http://localhost:8081
   - `token`: (empty, will be filled after login)
3. Run the tests in the collection

## License

This project is licensed under the MIT License - see the LICENSE file for details. 