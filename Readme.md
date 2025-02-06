# 🎥 VideoHub - Video Streaming Backend with Tweeting Feature 🐦

## 🌟 Overview

This project is a **backend** for a **video streaming platform** with an integrated **tweeting feature**. The backend is built using **🔥 Node.js** and **⚡ Express**, with **💾 MongoDB** as the database. The project leverages MongoDB's **🚀 aggregation pipelines** and **powerful** complex queries to efficiently handle data processing and retrieval.

## 🚀 Features

✅ **User authentication** (Signup/Login)  
✅ **Video upload, processing, and streaming** 🎬  
✅ **Real-time tweeting feature** for user engagement 📝  
✅ **Optimized data querying** with MongoDB aggregation pipelines 🏎️  
✅ **RESTful API endpoints** for seamless frontend interaction 🔗  
✅ **Middleware-based request validation** & error handling 🚦  
✅ **Subscriptions & Playlists** for user customization 📺  
✅ **Likes & Comments System** for enhanced engagement ❤️💬  

## 🛠️ Technologies Used

- **⚡ Node.js** & **Express.js** – Server-side framework
- **💾 MongoDB** – NoSQL database for storing user and video data
- **🛠️ Mongoose** – ODM for MongoDB
- **📂 Multer** – Handling file uploads
- **🔐 JWT** – Authentication and authorization
## 🏗️ Installation

### 🔹 Prerequisites

Ensure you have the following installed:

- **🖥️ Node.js** (v16 or later recommended)
- **💾 MongoDB** (local or cloud-based like MongoDB Atlas)

### 🔧 Setup Instructions

1️⃣ Clone the repository:
   ```sh
   git clone https://github.com/Cypher2801/YtBackend.git
   ```
2️⃣ Install dependencies:
   ```sh
   npm install
   ```
3️⃣ Create a `.env` file in the root directory and configure the following:
   ```env
   PORT=8000
MONGO_DB_URL=our-mongo-url
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

   ```
4️⃣ Start the server:
   ```sh
   npm start
   ```
   or in development mode:
   ```sh
   npm run dev
   ```

## 🔌 API Endpoints

### 🔑 Authentication

🔹 **POST /api/auth/signup** – Register a new user  
🔹 **POST /api/auth/login** – Authenticate a user  
🔹 **POST /api/auth/logout** – Log out user  
🔹 **POST /api/auth/refresh-token** – Refresh access token  

### 📹 Video Management

🎬 **POST /api/videos/publishVideo** – Upload & publish a new video  
🎥 **GET /api/videos/getVideoById/:videoId** – Stream a video by ID  
📃 **GET /api/videos/getAllVideos** – Fetch all available videos  
🛠️ **POST /api/videos/updateVideo/:videoId** – Update video details  

### 🐦 Tweeting Feature

📝 **POST /api/tweets/createTweet** – Post a new tweet  
📜 **GET /api/tweets/getUserTweets/:userId** – Retrieve user tweets  
✏️ **PATCH /api/tweets/updateTweet/:tweetId** – Update a tweet  
❌ **GET /api/tweets/deleteTweet/:tweetId** – Delete a tweet  

### 📌 Subscriptions

🔔 **GET /api/subscriptions/channel/:channelId** – Toggle subscription  
📢 **GET /api/subscriptions/getChannelSubscribers/:channelId** – Get subscribers  
📜 **GET /api/subscriptions/getSubscribedChannels/:subscriberId** – Get user subscriptions  

### 📺 Playlist Management

📂 **POST /api/playlists/createPlaylist** – Create a new playlist  
📜 **GET /api/playlists/getUserPlaylists/:userId** – Retrieve user playlists  
📋 **GET /api/playlists/getPlaylistById/:playlistId** – Get playlist details  
➕ **GET /api/playlists/addVideoToPlaylist/:playlistId/:videoId** – Add video to playlist  
➖ **GET /api/playlists/removeVideoFromPlaylist/:playlistId/:videoId** – Remove video  
🗑️ **GET /api/playlists/deletePlaylist/:playlistId** – Delete playlist  
✏️ **PATCH /api/playlists/updatePlaylist/:playlistId** – Update playlist  

### ❤️ Likes & Comments

👍 **GET /api/likes/video/:videoId** – Like/unlike a video  
💬 **POST /api/comments/addComment/:videoId** – Add a comment  
✏️ **PATCH /api/comments/updateComment/:commentId** – Update a comment  
🗑️ **GET /api/comments/deleteComment/:commentId** – Delete a comment  

## ⚙️ Database & Query Optimization

- 🚀 **MongoDB Aggregation Pipelines** used for optimized data retrieval.
- ⚡ **Indexes** on frequently queried fields like `userId` and `videoId`.
- 🔍 **Pagination & Filtering** implemented for scalability.
- ⏳ **Efficient query execution** to reduce server load.


