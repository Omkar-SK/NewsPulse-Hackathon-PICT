# 📊 NewsPulse — Intelligent News Aggregator with Caching, Reactions, and Search

NewsPulse is a full‑stack news aggregation platform that fetches real‑time headlines, performs sentiment analysis, and enables persistent reactions and bookmarks. It uses a 2‑hour backend cache so all users see the same curated feed within that window. Includes advanced search, filters, and a visual analytics dashboard.

---

## 🔗 Live Demo

**URL:** [https://your-deployed-url-here.com](https://your-deployed-url-here.com)  
**Note:** On free hosting, the app may take 30–60 seconds to wake up.

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
