# DevGram

> **DevGram** — a developer-first social & collaboration platform for sharing projects, authoring technical blogs, and collaborating in real time.

---

## 🎯 Why DevGram

DevGram brings together three workflows developers use every day:

* **Project-centric sharing** — showcase code, demos and deploy links.
* **Long-form technical content** — publish blogs and knowledge articles.
* **Team collaboration** — fast DMs and Slack-like workspaces with channels.

Designed for modern teams and open-source creators, DevGram pairs a familiar GitHub-style project model with a discovery feed and production-ready real-time chat.

---

## ✨ Highlights

* JWT-based authentication and username routing
* Unified feed (projects + blogs) with tag & text search
* Socket.io real-time chats for DMs and workspace channels
* Cloudinary-backed image and file uploads with inline previews
* Role-based workspace permissions and message persistence
* Production-ready architecture notes for scaling and security

---

## 🧩 Tech Stack

**Frontend**

* React (Vite), React Router, Tailwind CSS
* Axios, Socket.io client, Lucide icons

**Backend**

* Node.js, Express, Mongoose (MongoDB)
* Socket.io for real-time events
* JWT auth, Cloudinary integration

**Infrastructure**

* MongoDB Atlas, Cloudinary
* Deployable to Vercel / Netlify (frontend) and Render / Railway (backend)

---

## 📁 Suggested Repository Layout

```
/devgram
├─ backend/
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ services/        # socket handlers, cloudinary, mailers
│  ├─ middlewares/
│  ├─ utils/
│  ├─ config/
│  └─ app.js
├─ frontend/
│  ├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  └─ vite.config.js
├─ docker-compose.yml
├─ README.md
└─ CONTRIBUTING.md
```

---

## 🚀 Quickstart (Development)

**Prereqs**: Node ≥16, npm/yarn, MongoDB (Atlas or local), Cloudinary account

1. Clone

```bash
git clone https://github.com/AbhinavNeema/DevGram.git
cd DevGram
```

2. Install & configure

```bash
# Backend
cd backend && npm install
# Frontend (new terminal)
cd ../frontend && npm install
```

3. Create `backend/.env` with the following keys

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

4. Run

```bash
# Start backend
cd backend && npm run dev
# Start frontend
cd ../frontend && npm run dev
```

Open `http://localhost:5173` (frontend) and `http://localhost:5001` (API).

---

## 🧭 API Overview (Core Endpoints)

> Minimal summary — see `backend/routes` for full API contract and request/response examples.

* `POST /auth/register` — register a user
* `POST /auth/login` — authenticate (returns JWT)
* `GET /users/:username` — public profile
* `GET /feed` — unified feed (projects + blogs)
* `POST /projects` — create project (auth required)
* `POST /blogs` — create blog (auth required)
* `POST /upload` — file/image upload (Cloudinary)
* Socket events: `message:new`, `message:edit`, `message:delete`, `presence:update`

---

## 🔒 Production & Security Checklist

* Serve over HTTPS (managed TLS)
* Short-lived JWTs + refresh tokens
* Input validation & sanitization (prevent NoSQL injection)
* Use `helmet`, `compression`, and `express-rate-limit`
* Signed Cloudinary uploads for client-side uploads
* Secrets via platform-managed stores (avoid repo commits)
* Socket scaling with Redis adapter for horizontal instances

---

## ✅ Deployment Recommendations

* **Frontend**: Deploy static build to Vercel / Netlify
* **Backend**: Host on Render / Railway / Docker + Kubernetes
* **DB**: MongoDB Atlas (replica set + backups)
* **Media**: Cloudinary (CDN)
* **Sockets**: Redis adapter + sticky sessions behind LB

Provide a `Dockerfile` and `docker-compose.yml` for an easy production-ish snapshot.

---

## 🛠 CI / DX suggestions

* Add GitHub Actions for linting, tests, and `npm run build`
* Add an ESLint + Prettier pre-commit hook (husky) for consistent style
* Add `SERVER_URL` & `FRONTEND_URL` integration tests in CI

---

## 📈 Roadmap & Future Work

* Cursor-based pagination and infinite scroll
* Saved posts / bookmarks and multi-device notifications
* Notification center (in-app + email)
* Full-text search (MongoDB Atlas Search or Elastic)
* AI-based feed ranking and content recommendations

---

## 🤝 Contributing

Contributions are welcome. Please follow this flow:

1. Fork the repo
2. Create a topic branch: `git checkout -b feat/awesome`
3. Open a PR with a clear description and linked issue

Please include tests for new functionality and adhere to conventional commits.

---


## 📬 Contact

**Abhinav Neema**  
- GitHub: https://github.com/AbhinavNeema  
- LinkedIn: https://www.linkedin.com/in/abhinav-neema-95a69931a/

---
