# 📊 NewsPulse – Intelligent News Aggregator

**NewsPulse** is a dynamic, full-stack news aggregation platform that fetches real-time headlines from around the world.  
It enhances the user experience with **AI-powered sentiment analysis**, a **persistent reaction system**, and a **robust backend caching mechanism** to deliver a fast, shared, and interactive news browsing experience.

---

## ✨ Live Demo

🔗 **[Visit NewsPulse Live on Render](https://newspulse-hackathon-pict.onrender.com/)**  

> ⚠️ *Note:* The free-tier hosting may take **30–60 seconds** to wake up on the first visit.

---

## 📸 Project Showcase

🖼️
A Youtube prototype demo of whole project and it working **[youtube link](https://youtu.be/EbBqO5PS2wM)**.

---

## ⭐ Core Features

- 👤 **User Authentication:** Secure sign-up and login system using JWT (JSON Web Tokens).  
- ⚡ **Real-Time News Feed:** Fetches articles from NewsAPI.ai based on user-selected filters.  
- 🧠 **Sentiment Analysis:** Automatically analyzes and displays the sentiment (Positive, Negative, Neutral) of each article.  
- 🚀 **Backend Caching:** Articles are cached for 2 hours, providing a fast and shared experience for all users.  
- 👍 **Persistent Reactions:** Users can react (Like, Dislike, Neutral) to articles, with counts accumulating across all users in real-time.  
- 🔖 **Bookmarking:** Logged-in users can save articles to their private bookmark list.  
- 🔍 **Advanced Filtering & Search:**
  - Filter news by category, country, and language.  
  - Full-text search through headlines and summaries.  
- 📈 **Analytics Dashboard:** Visualizes data with charts for:
  - Sentiment Distribution  
  - News Source Distribution  
  - Category Breakdown  
  - Trending Keywords (Word Cloud)  
- 🌗 **Dark Mode:** Sleek, user-friendly dark theme for comfortable night-time browsing.  
- 📱 **Responsive Design:** Fully functional and visually appealing on all devices, from mobile to desktop.

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | HTML5, CSS3 (with Custom Properties), Vanilla JavaScript (ES6+), Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose (ODM) |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js |
| **External API** | NewsAPI.ai (EventRegistry) |
| **Deployment** | Render.com (Full-Stack Hosting), MongoDB Atlas (Cloud Database) |
| **Validation** | express-validator |
| **Dev Tools** | nodemon, dotenv |

---

## 🏗️ Architecture & Data Flow

This project follows a **classic MERN-like stack architecture (without React)** where a Vanilla JS frontend communicates with a backend RESTful API.

### 🧩 High-Level Data Flow
User Interaction → Frontend (index.html) → API Call → Express Backend → Business Logic → MongoDB / NewsAPI



### ⚙️ Key System Logic

#### 🗄️ News Caching System
1. When a user requests news, the backend first checks its MongoDB `articles` collection for fresh (non-expired) cached data.  
2. **Cache Hit:** If found, it serves the articles directly from the database — extremely fast.  
3. **Cache Miss:** If not found (or expired), it fetches data from **NewsAPI.ai**, saves the new articles to the database with a **2-hour expiry**, and serves them to the user.  
4. A background job runs hourly to clean up expired articles, keeping the database efficient.

#### 💬 Persistent Reaction System
1. Each user reaction is a document in the `reactions` collection, linking a `user`, `articleId`, and `reactionType`.  
2. A compound unique index on `{ user, articleId }` ensures one user can only have one reaction per article.  
3. When a user reacts, the backend creates or updates their specific reaction document.  
4. It then uses a **MongoDB Aggregation Pipeline** to recalculate the total counts (likes, dislikes, neutral) for that article across all users and returns the new totals.  
5. The frontend updates the UI in real-time with the new counts.

---

## 🚀 Getting Started Locally

Follow these steps to run the project locally for development and testing.

### 1️⃣ Prerequisites
You must have these installed:

- [Node.js](https://nodejs.org/) (v18.x or higher)  
- npm (comes with Node.js)  
- [MongoDB](https://www.mongodb.com/) (local or Atlas account)

---

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/NewsPulse.git
cd NewsPulse
```
3️⃣ Install Dependencies
```bash
npm install
```
4️⃣ Set Up Environment Variables

Create a .env file in the project root and add:
-env
.env.example

# Server Port
```
PORT=5000
```

# MongoDB Connection String
# Local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/newspulse
```
# Or MongoDB Atlas:
```
# MONGODB_URI=mongodb+srv://newspulse_admin:2Qpu4ppc9aPKLxR2
@cluster0.4e17r0p.mongodb.net/newspulse?appName=Cluster0
```
# JWT Configuration
 Generate a strong secret with:
 node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
 (or type random keys form keyboard to generate a strong password)
JWT_SECRET=your_super_secret_key_that_is_very_long_and_random
JWT_EXPIRE=7d

# External API Key
```
NEWS_API_KEY=your_newsapi_ai_key_here
```
5️⃣ Run the Application

# Start the server (with hot-reloading)
```
npm run dev
```

# For production
```
npm start
```
The app will run on 👉 http://localhost:5000

🔌 API Endpoints
```
Method	Endpoint	Description	Access
POST	/api/auth/signup	Register a new user	Public
POST	/api/auth/login	Authenticate a user	Public
GET	/api/auth/me	Get current logged-in user profile	Private
GET	/api/news	Get cached or fresh news articles	Public
GET	/api/news/search	Search for news articles	Public
POST	/api/reactions	Add or update a reaction to an article	Private
GET	/api/reactions/user/:articleId	Get a user's reaction for an article	Private
GET	/api/bookmarks	Get all bookmarks for a user	Private
POST	/api/bookmarks	Add an article to bookmarks	Private
DELETE	/api/bookmarks/:id	Remove an article from bookmarks	Private
```
#☁️ Deployment
```This project is deployed as a single full-stack app on Render.

🌐 Web Service: Node.js + Express server

🏗️ Build Command: npm install

▶️ Start Command: npm start

🗄️ Database: MongoDB Atlas (Free Tier)

🔁 Auto-Deploy: Linked to GitHub – redeploys automatically on each push to main
```
#🔮 Future Enhancements
```
🔔 Real-Time Notifications: Use WebSockets (Socket.io) to notify users of breaking news or reactions.

🧭 Personalized “For You” Feed: Use reaction & bookmark history to recommend news.

💬 Commenting System: Allow users to comment on articles.

🌍 Social Sharing: Add quick-share buttons for social platforms.

🛡️ Admin Dashboard: Manage users and view global analytics.
