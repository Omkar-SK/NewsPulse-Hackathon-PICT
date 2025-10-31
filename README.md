📊 NewsPulse - Intelligent News Aggregator
NewsPulse is a dynamic, full-stack news aggregation platform that fetches real-time headlines from around the world. It enhances the user experience with AI-powered sentiment analysis, a persistent reaction system, and a robust backend caching mechanism to deliver a fast, shared, and interactive news browsing experience.

✨ Live Demo
https://newspulse.onrender.com/

(Note: The free-tier hosting may take 30-60 seconds to wake up on the first visit.)

📸 Project Showcase
Replace this with a link to your own screenshot or GIF! A great tool for this is ScreenToGif.

⭐ Core Features
👤 User Authentication: Secure sign-up and login system using JWT (JSON Web Tokens).
⚡ Real-Time News Feed: Fetches articles from NewsAPI.ai based on user-selected filters.
🧠 Sentiment Analysis: Automatically analyzes and displays the sentiment (Positive, Negative, Neutral) of each article.
🚀 Backend Caching: Articles are cached for 2 hours, providing a fast and shared experience for all users.
👍 Persistent Reactions: Users can react (Like, Dislike, Neutral) to articles, with counts accumulating across all users in real-time.
🔖 Bookmarking: Logged-in users can save articles to their private bookmark list.
🔍 Advanced Filtering & Search:
Filter news by category, country, and language.
Full-text search through headlines and summaries.
📈 Analytics Dashboard: Visualizes data with charts for:
Sentiment Distribution
News Source Distribution
Category Breakdown
Trending Keywords (Word Cloud)
🌗 Dark Mode: Sleek, user-friendly dark theme for comfortable night-time browsing.
📱 Responsive Design: Fully functional and visually appealing on all devices, from mobile to desktop.
🛠️ Tech Stack
Category	Technology
Frontend	HTML5, CSS3 (with Custom Properties), Vanilla JavaScript (ES6+), Chart.js
Backend	Node.js, Express.js
Database	MongoDB with Mongoose (ODM)
Authentication	JSON Web Tokens (JWT), bcrypt.js
External API	NewsAPI.ai (EventRegistry)
Deployment	Render.com (Full-Stack Hosting), MongoDB Atlas (Cloud Database)
Validation	express-validator
Dev Tools	nodemon, dotenv
🏗️ Architecture & Data Flow
This project follows a classic MERN-like stack architecture (without React) where a Vanilla JS frontend communicates with a backend RESTful API.

High-Level Data Flow:
User Interaction -> Frontend (index.html) -> API Call -> Express Backend -> Business Logic -> MongoDB / NewsAPI

Key System Logic:
News Caching System:

When a user requests news, the backend first checks its MongoDB articles collection for fresh (non-expired) cached data.
Cache Hit: If found, it serves the articles directly from the database, which is extremely fast.
Cache Miss: If not found (or expired), it fetches data from the external NewsAPI.ai, saves the new articles to the database with a 2-hour expiry, and then serves them to the user.
A background job runs hourly to clean up expired articles, keeping the database efficient.
Persistent Reaction System:

Each user reaction is a document in the reactions collection, linking a user, an articleId, and a reactionType.
A compound unique index on { user, articleId } ensures one user can only have one reaction per article.
When a user reacts, the backend creates or updates their specific reaction document.
It then uses a MongoDB Aggregation Pipeline to recalculate the total counts (likes, dislikes, neutral) for that article across all users and returns the new totals.
The frontend updates the UI in real-time with the new counts.
🚀 Getting Started Locally
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

1. Prerequisites
You need to have the following installed on your machine:

Node.js (v18.x or higher)
npm (comes with Node.js)
MongoDB (or a MongoDB Atlas account)
2. Clone the Repository
Bash

git clone https://github.com/your-username/NewsPulse.git
cd NewsPulse
3. Install Dependencies
Bash

npm install
4. Set Up Environment Variables
Create a file named .env in the root directory of the project and add the following variables.

env

# .env.example

# Server Port
PORT=5000

# MongoDB Connection String
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/newspulse
# For MongoDB Atlas (replace with your string):
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/newspulse?retryWrites=true&w=majority

# JWT Configuration
# Generate a strong secret with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secret_key_that_is_very_long_and_random
JWT_EXPIRE=7d

# External API Key
NEWS_API_KEY=your_newsapi_ai_key_here
5. Run the Application
Bash

# Start the server (with hot-reloading using nodemon)
npm run dev

# Or for production mode:
npm start
The application will be available at http://localhost:5000.

🔌 API Endpoints
A brief overview of the available API endpoints.

Method	Endpoint	Description	Access
POST	/api/auth/signup	Register a new user.	Public
POST	/api/auth/login	Authenticate a user.	Public
GET	/api/auth/me	Get current logged-in user profile.	Private
GET	/api/news	Get cached or fresh news articles.	Public
GET	/api/news/search	Search for news articles.	Public
POST	/api/reactions	Add or update a reaction to an article.	Private
GET	/api/reactions/user/:articleId	Get a user's reaction for an article.	Private
GET	/api/bookmarks	Get all bookmarks for a user.	Private
POST	/api/bookmarks	Add an article to bookmarks.	Private
DELETE	/api/bookmarks/:id	Remove an article from bookmarks.	Private
☁️ Deployment
This project is deployed as a single full-stack application on Render.

Web Service: A Node.js environment runs the Express server.
Build Command: npm install
Start Command: npm start
Database: A free-tier MongoDB Atlas cluster is used for persistent data storage.
Auto-Deploy: The service is connected to the GitHub repository and automatically redeploys on every push to the main branch.
🔮 Future Enhancements
 Real-Time Notifications: Implement WebSockets (e.g., Socket.io) to notify users of breaking news or reactions in real-time.
 Personalized "For You" Feed: Use user's reaction and bookmark history to create a simple recommendation algorithm.
 Commenting System: Allow users to comment on articles.
 Social Sharing: Add buttons to share articles on social media platforms.
 Admin Dashboard: A panel for administrators to manage users and view site-wide analytics.
