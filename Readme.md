# DevGram

DevGram is a **developer-first social and collaboration platform** where developers can share projects, publish technical blogs, collaborate in real time, and discover new developers and technologies.

It combines **developer portfolios, social networking, and team collaboration tools** into a single platform built specifically for developers.

---

# Overview

Developers usually use multiple platforms:

- GitHub for code hosting
- Medium / Dev.to for blogging
- Discord / Slack for collaboration
- LinkedIn / Twitter for sharing work

DevGram brings these workflows together into **one unified ecosystem**.

Developers can:

- Share projects
- Publish technical blogs
- Discover developers
- Collaborate via messaging
- Work together in shared workspaces
- Explore a personalized developer feed

---

# Features

## Developer Profiles

Each user has a public developer profile containing:

- Profile photo and bio
- Skills and interests
- Projects and blogs
- Followers and following

This allows developers to maintain a **public developer portfolio**.

---

## Project Sharing

Developers can showcase their projects with:

- Project title and description
- Technology stack tags
- GitHub repository links
- Live demo links
- Screenshots or media uploads
- Engagement metrics

---

## Technical Blogging

DevGram supports **long-form technical blogs** where developers can share:

- Tutorials
- System design explanations
- Engineering insights
- Development experiences

Blogs support tagging, comments, and engagement metrics.

---

## Social Interactions

Users can:

- Follow other developers
- Like posts
- Comment on blogs and projects
- Discover content via tags

This enables networking and community engagement.

---

# Workspaces & Collaboration

DevGram includes **Workspaces**, collaborative environments where teams can organize and communicate.

Workspaces allow developers to:

- Collaborate in teams
- Organize discussions
- Manage members
- Share updates on projects

---

## Role-Based Access Control (RBAC)

Workspaces use role-based permissions.

### Owner
- Full control of the workspace
- Manage roles
- Delete workspace

### Admin
- Manage members
- Create channels
- Moderate conversations

### Member
- Participate in discussions
- Send messages
- Access shared resources

---

# Real-Time Messaging

DevGram provides **real-time communication using Socket.io**.

Features include:

- Direct messages
- Workspace channel messaging
- Message editing and deletion
- Persistent chat history
- Online presence indicators

---

# Personalized Feed & Recommendation System

DevGram uses a **custom feed ranking system** to deliver relevant content.

The feed combines multiple signals:

- Content similarity
- Recency decay
- Engagement scoring
- Follow prioritization
- Trending posts
- Exploration posts

---

## Feed Characteristics

- Cursor-based pagination

```
/feed?cursor=0&limit=20
```

- Infinite scrolling
- Tag-based filtering
- Seen-content filtering
- Guaranteed inclusion of followed users' posts

---

# Tech Stack

## Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Socket.io Client

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.io

---

## Infrastructure

- MongoDB Atlas
- Cloudinary
- Vercel (frontend)
- Render (backend)

---

# Project Structure

```
DevGram
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── socket
│   ├── utils
│   ├── config
│   └── server.js
│
├── frontend
│   ├── src
|   |   ├── api
│   │   ├── components
│   │   ├── pages
|   |   ├── layouts
│   │   ├── routes
│   │   ├── context
|   |   ├── constants
│   │   └── utils
│   │
│   └── vite.config.js
│
└── README.md
```

---

# Getting Started

## Clone the Repository

```
git clone https://github.com/AbhinavNeema/DevGram.git
cd DevGram
```

---

# Install Dependencies

Backend

```
cd backend
npm install
```

Frontend

```
cd frontend
npm install
```

---

# Environment Variables

Create a `.env` file inside the backend folder.

```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

---

# Run Development Servers

Backend

```
cd backend
npm run dev
```

Frontend

```
cd frontend
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

Backend API runs at:

```
http://localhost:5001
```

---

# Contributing

Contributions are welcome.

Steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

# Author

**Abhinav Neema**

GitHub  
https://github.com/AbhinavNeema