# Skill-Sharing Platform

A full-stack application for sharing and learning skills, built with Spring Boot and React. 

## Project Structure    

```
skill-sharing-platform/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/skillshare/
│   │   │   │       ├── config/         # Configuration classes
│   │   │   │       ├── controller/     # REST controllers
│   │   │   │       ├── model/          # Data models
│   │   │   │       ├── repository/     # MongoDB repositories
│   │   │   │       ├── service/        # Business logic
│   │   │   │       └── dto/            # Data Transfer Objects
│   │   │   └── resources/
│   │   │       ├── application.yml     # Application configuration
│   │   │       └── application-dev.yml # Development configuration
│   │   └── test/                       # Test classes
│   └── pom.xml                         # Maven dependencies
│
└── frontend/               # React frontend
    ├── public/             # Static files
    └── src/
        ├── components/     # Reusable UI components
        ├── pages/          # Page components
        ├── services/       # API services
        ├── context/        # React context
        ├── hooks/          # Custom hooks
        ├── utils/          # Utility functions
        └── styles/         # CSS/SCSS files
```

## Features

- User Authentication and Authorization
- Skill Listing and Management
- User Profiles
- Skill Request and Offer System
- Messaging System
- Rating and Review System

## Tech Stack

### Backend
- Spring Boot
- Spring Security
- Spring Data MongoDB
- JWT Authentication
- Maven

### Frontend
- React
- Material-UI
- Axios
- React Router
- Redux Toolkit

### Database
- MongoDB

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MongoDB
- Maven
- npm or yarn

### Backend Setup
1. Navigate to the backend directory
2. Run `mvn clean install`
3. Configure MongoDB connection in `application.yml`
4. Run the application using `mvn spring-boot:run`

### Frontend Setup
1. Navigate to the frontend directory
2. Run `npm install`
3. Run `npm start`

## Development Guidelines

1. Follow the existing folder structure for new features
2. Write meaningful commit messages
3. Create feature branches for new developments
4. Write unit tests for both backend and frontend
5. Document API endpoints and component usage 
