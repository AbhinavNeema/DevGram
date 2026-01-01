# 🚀 DevGram

DevGram is a developer-focused social platform where developers can share projects, explore trending work, discover technologies, and connect with other developers.  
It combines the project-centric mindset of GitHub with the social feed experience of LinkedIn — built specifically for developers.

---

## 🌟 Features

### 👤 Authentication & Profiles
- JWT-based authentication
- Public developer profiles
- Username-based routing (`@username`)
- Editable bio, skills, and about section

### 📦 Projects
- Create, edit, and delete projects
- Upload multiple images using Cloudinary
- Predefined technology tags
- GitHub & live demo links
- Mentions (`@username`) in posts and comments

### ❤️ Engagement
- Like projects
- Comment on projects
- Unique view tracking per user
- Notifications for likes and comments

### 🧠 Smart Feed System
- Personalized feed
  - Users never see the same project twice
  - Even non-interacted projects do not reappear
- Trending feed
  - Ranked by views, likes, and recency
  - Excludes already seen projects
- Tag-based feed filtering

### 🔍 Search & Discovery
- Search by project title
- Search by technology tags
- Search by username
- Clickable tags to filter feed
- Dedicated trending projects page

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication

### Cloud & Services
- Cloudinary
- MongoDB Atlas

---

## 📁 Project Structure

```txt
devgram/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── .gitignore

###⚙️ Environment Variables

Create a .env file inside the backend folder: