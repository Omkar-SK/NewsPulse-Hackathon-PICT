# 📊 NewsPulse — Intelligent News Aggregator with Caching, Reactions, and Search

NewsPulse is a full‑stack news aggregation platform that fetches real‑time headlines, performs sentiment analysis, and enables persistent reactions and bookmarks. It uses a 2‑hour backend cache so all users see the same curated feed within that window. Includes advanced search, filters, and a visual analytics dashboard.

---

## 🔗 Live Demo

**URL:** [render depoloyed prototype link](https://newspulse-hackathon-pict.onrender.com/)  
**Note:**  the app may take 30–60 seconds or somtime even minutes to wake up so please wait for it.
And to see all the feature like bookmark and reactions please login/signup using a login button at top right corner .

---

## 🧭 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#️-getting-started-local)
- [Environment Variables](#-environment-variables)
- [Run the App](#️-run-the-app)
- [API Endpoints](#-api-endpoints)
- [Deployment (Render + MongoDB Atlas)](#️-deployment-render--mongodb-atlas)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#️-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **User Authentication** — Secure signup/login using JWT, passwords hashed with bcrypt.
- **Real‑Time News Feed** — Fetches headlines from NewsAPI.ai (EventRegistry).
- **Backend Caching (2 hours)** — Articles cached in MongoDB; all users see the same feed within the cache window.
- **Persistent Reactions** — Like / Dislike / Neutral with counts aggregated across all users.
- **Bookmarks** — Save articles to your personal list (private).
- **Advanced Search** — Full‑text search across titles and summaries.
- **Filters** — By category, country, and language.
- **Analytics Dashboard** — Sentiment distribution, source breakdown, category stats, and word cloud.
- **Dark Mode** — Modern UI with theme toggle.
- **Responsive Design** — Looks great on mobile, tablet, and desktop.

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT, bcrypt |
| **External API** | NewsAPI.ai (EventRegistry) |
| **Validation** | express-validator |
| **Deployment** | Render (web service), MongoDB Atlas (cloud DB) |
| **Dev Tools** | nodemon, dotenv |

---

## 🧠 Architecture Overview

1. **Frontend** (`public/index.html`) calls RESTful API endpoints.
2. **Backend** (Express) handles:
   - **News Caching** — Saves articles with `cacheKey` and `expiresAt` (2 hours).
   - **Reactions** — One user → one reaction per article (via a compound unique index on `{ user, articleId }`), aggregated counts for everyone.
   - **Bookmarks** — User‑specific saved items.
3. **MongoDB** stores:
   - Users, Articles (cache), Reactions, Bookmarks.

### High‑level flow:

---

## 🧭 Project Structure

```text
NewsPulse/
├── controllers/
│   ├── authController.js
│   ├── bookmarkController.js
│   ├── newsController.js
│   └── reactionController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Article.js
│   ├── Bookmark.js
│   ├── Reaction.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── bookmarks.js
│   ├── news.js
│   └── reactions.js
├── public/
│   └── index.html
├── .env              (not committed)
├── .gitignore
├── package.json
└── server.js

🛠️ Getting Started (Local)
1. Clone the repo
Bash

git clone https://github.com/your-username/NewsPulse.git
cd NewsPulse
2. Install dependencies
Bash

npm install
3. Create your .env file (see next section)
4. Run the server (dev mode)
Bash

npm run dev
App runs at: http://localhost:5000

🔐 Environment Variables
Create a .env file in the project root:

env

# Server
PORT=5000
NODE_ENV=development

# MongoDB (choose ONE)
# Local:
MONGODB_URI=mongodb://localhost:27017/newspulse
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/newspulse?retryWrites=true&w=majority

# Auth
# Generate a strong secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_long_random_secret_here
JWT_EXPIRE=7d

# External API (EventRegistry / NewsAPI.ai)
NEWS_API_KEY=your_newsapi_ai_key_here
▶️ Run the App
Development (with nodemon)
Bash

npm run dev
Production
Bash

npm start
Open: http://localhost:5000

🔌 API Endpoints
Auth
POST /api/auth/signup — Create account
POST /api/auth/login — Authenticate and get JWT
GET /api/auth/me — Get current user (requires Authorization: Bearer <token>)
News
GET /api/news?category=&country=&lang= — Get articles (from cache or API)
GET /api/news/search?query=&lang= — Search articles
GET /api/news/similar/:uri — Get similar articles
Reactions
POST /api/reactions — Add or update reaction { articleId, reactionType } (auth required)
GET /api/reactions/article/:articleId — Reaction counts (public)
GET /api/reactions/user/:articleId — User's reaction for an article (auth required)
Bookmarks
GET /api/bookmarks — List user bookmarks (auth required)
POST /api/bookmarks — Add bookmark (auth required)
DELETE /api/bookmarks/:id — Remove bookmark (auth required)
☁️ Deployment (Render + MongoDB Atlas)
1) MongoDB Atlas
Create a free cluster (M0) → Database Access → add a user (read/write).
Network Access → allow 0.0.0.0/0 (or specific IPs).
Copy the connection string and set it as MONGODB_URI in Render.
2) Render Web Service
Connect your GitHub repo → New Web Service
Environment: Node
Build Command: npm install
Start Command: npm start
Instance: Free
Environment Variables: Add all from .env (never commit .env)
3) Server must serve frontend
Make sure server.js includes:

JavaScript

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
4) Frontend base URL
In public/index.html, the API base is set dynamically:

JavaScript

const API_BASE_URL = window.location.origin + '/api';
🧪 How Things Work
Backend Caching (2 hours)
Articles saved with { cacheKey, expiresAt }
On request:
Cache hit → return cached
Cache miss → fetch from NewsAPI.ai, save, return
Cleanup job runs every hour to delete expired articles.
Reactions
One user per article via unique index: { user: 1, articleId: 1 }
Reactions aggregated with MongoDB aggregation pipeline
Counts returned immediately to update the UI.
🩺 Troubleshooting
Issue	Solution
"Cannot connect to DB"	Check MONGODB_URI and Network Access in Atlas.
"CORS error"	Ensure you didn't restrict CORS improperly; default cors() is fine for same‑origin.
Slow first load on Render	Free tier cold start; use a pinger like UptimeRobot on /health.
Reactions not updating	Ensure indexes are correct: ReactionSchema.index({ user: 1, articleId: 1 }, { unique: true });
🗺️ Roadmap
 Socket.io for real‑time reactions/updates
 Personalized feed from reaction history
 Comments on articles
 Social sharing
 Admin dashboard

