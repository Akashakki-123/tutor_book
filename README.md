# Tutor Book - Teacher-User Session Booking Backend API

A REST API backend application built with **Node.js**, **TypeScript**, **Express.js**, **MongoDB**, and **Mongoose** for booking sessions between students (users) and teachers.

---

## 🛠 Tech Stack
- **Runtime**: Node.js (v20+ / v22+ / v26+)
- **Language**: TypeScript (Strict Mode, ES Modules / NodeNext)
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose (v9)
- **Security & Utilities**: bcryptjs, jsonwebtoken, cors, compression, morgan, dotenv

---

## 🚀 Setup & Installation Instructions

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your MongoDB connection:
```bash
cp .env.example .env
```

Default `.env` settings:
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/tutor_book
JWT_SECRET=tutor_book_secret_key_development_only
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### 3. Run the Application

#### Option A: Build & Start (Recommended)
```bash
npm run build
npm start
```

#### Option B: Development Watch Mode
```bash
node --watch index.ts
```

Server will start on `http://localhost:8000` and automatically connect to MongoDB.

---

## 📚 API Documentation

### API 1 - Create User
- **Method**: `POST`
- **Endpoint**: `/users` (or `/auth/register`)
- **Description**: Creates a new user with a hashed password. Email must be unique.
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "password": "Password@123"
  }
  ```
- **Response**: `201 Created`

---

### Authentication - User Login
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Description**: Verifies email & password, returns JWT Bearer token and user info.
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "Password@123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": true,
    "subCode": 200,
    "message": "Login success",
    "items": {
      "token": "eyJhbGciOi...",
      "userId": "67b0c...",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER"
    }
  }
  ```

---

### Helper - Create Teacher
- **Method**: `POST`
- **Endpoint**: `/teachers`
- **Request Body**:
  ```json
  {
    "fullName": "Dr. Alan Turing",
    "email": "alan.turing@example.com",
    "specialization": "Algorithms & Computer Science",
    "experience": 10
  }
  ```
- **Response**: `201 Created`

---

### API 2 - Create Session
- **Method**: `POST`
- **Endpoint**: `/sessions`
- **Description**: Creates a new session for a teacher. Validates that the teacher exists and `endTime > startTime`. Default status is `AVAILABLE`.
- **Request Body**:
  ```json
  {
    "teacherId": "67b0d...",
    "startTime": "2026-10-25T10:00:00.000Z",
    "endTime": "2026-10-25T11:00:00.000Z"
  }
  ```
- **Response**: `201 Created`

---

### API 3 - Available Sessions for Booking
- **Method**: `GET`
- **Endpoint**: `/sessions/available?dateTimestamp={timestamp}`
- **Description**: Returns all `AVAILABLE` sessions for the given date.
- **Implementation**: Built using **MongoDB Aggregation Pipeline** (`$match`, `$lookup`, `$unwind`, `$sort`).
- **Example**: `GET /sessions/available?dateTimestamp=2026-10-25`
- **Response**: `200 OK`

---

### API 4 - Book Session
- **Method**: `POST`
- **Endpoint**: `/sessions/:id/book`
- **Description**: Books an available session for a user. Validates that the user exists and the session is currently available. A booked session cannot be booked again.
- **Request Body**:
  ```json
  {
    "userId": "67b0c..."
  }
  ```
- **Response**: `200 OK`

---

### API 5 - Mark Session Complete
- **Method**: `PATCH`
- **Endpoint**: `/sessions/:id/complete`
- **Description**: Marks a booked session as complete. Sets status to `COMPLETED` and assigns `completedAt` timestamp.
- **Response**: `200 OK`

---

### API 6 - User Session List
- **Method**: `GET`
- **Endpoint**: `/users/:id/sessions`
- **Description**: Returns all sessions for the user divided into **Upcoming Sessions** and **Completed Sessions**.
- **Implementation**: Built using **MongoDB Aggregation Pipeline** with `$facet` to perform grouping in a single database operation.
- **Response**: `200 OK`
  ```json
  {
    "status": true,
    "subCode": 200,
    "message": "User sessions retrieved successfully",
    "items": {
      "upcomingSessions": [...],
      "completedSessions": [...]
    }
  }
  ```

---

## 📮 Postman Collection
Import `TutorBook.postman_collection.json` into Postman to test all endpoints out of the box.

