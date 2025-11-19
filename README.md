📘 Job Importer – Scalable Queue-Based Job Feed Ingestion

A complete demo system that fetches job posts from external XML/RSS feeds, converts them to JSON, queues them using Redis + BullMQ, processes them with background workers, stores them in MongoDB, and tracks all imports using a dedicated history log.

This project is structured as a real-world, production-ready system that demonstrates system design, modular backend architecture, queue processing, cron schedulers, and a simple admin UI built with Next.js.

🚀 Features
✔ Automated Job Feed Ingestion

Fetches jobs from multiple XML-based RSS feeds

Converts XML → JSON using xml2js

Normalizes job fields into a consistent schema

✔ Queue-Based Processing (BullMQ + Redis)

Jobs inserted into Redis queue

Background worker processes feed batches

Supports concurrency and retries (exponential backoff)

✔ Import History Tracking

Each import run logs:

totalFetched

totalImported

newJobs

updatedJobs

failedJobs[]

timestamp

sourceUrl

Stored in import_logs collection.

✔ Simple Admin Dashboard (Next.js)

View import history in a clean table

Auto-updates on page reload

Easy to customize

✔ Modular, Scalable Codebase

Services, controllers, workers, queues in separate folders

Ready for microservice conversion

🏗️ Technologies Used
Backend

Node.js

Express.js

BullMQ (background job queue)

Redis (queue storage)

MongoDB + Mongoose (database)

XML2JS (XML parsing)

node-cron (scheduled imports)

Frontend

Next.js

React

SWR (data fetching)

Infrastructure

Docker + Docker Compose (local setup)

MongoDB Atlas (cloud database – optional for deployment)

Redis Cloud / Upstash (optional for cloud deployment)

📁 Project Structure
/client                   # Next.js Admin UI
/server                   # Node.js backend + worker
   /src
      /config             # DB config
      /models             # Mongoose schemas
      /services           # XML fetch & normalize logic
      /queues             # BullMQ queue setup
      /workers            # Worker process
      /jobs               # Cron scheduler
      /controllers        # API controllers
      /routes             # Express routes
docker-compose.yml        # Redis + Mongo local setup
README.md

⚙️ How to Run the Project (Local Setup)
1. Clone the repository
git clone <your-repo-url>
cd job-importer-assignment

2. Start MongoDB + Redis using Docker
docker compose up -d


Verify containers:

docker ps


You should see:

mongo (port 27017)

redis (port 6379)

3. Start Backend API (Server)
cd server
npm install
copy .env.example .env    # or manually create .env
npm run dev


Server runs at:

http://localhost:4000


Health check:

http://localhost:4000/health

4. Start Worker

In a new terminal:

cd server
npm run worker


This listens to Redis and processes job batches.

5. Start Client (Admin Dashboard)
cd client
npm install
npm run dev


Open:

http://localhost:3000/imports

🔌 API Endpoints
Health Check
GET /health

Trigger Import Manually
POST /api/imports/trigger
Body: { "sourceUrl": "<feed_url>" }

Get Import History
GET /api/imports

Get Import History with pagination
GET /api/imports?page=1&limit=20

🧪 Testing APIs with Postman
Trigger import
POST http://localhost:4000/api/imports/trigger


Body:

{
  "sourceUrl": "https://www.higheredjobs.com/rss/articleFeed.cfm"
}

View import logs
GET http://localhost:4000/api/imports

☁️ Deployment Overview
Recommended Deployment Setup
Component	Platform
Frontend (Next.js)	Vercel
Backend API	Render Web Service
Worker	Render Background Worker
MongoDB	MongoDB Atlas
Redis	Redis Cloud / Upstash
Required Environment Variables (Server + Worker)
MONGO_URI=<your-mongodb-atlas-uri>
REDIS_URL=<your-redis-url>
FEEDS=https://jobicy.com/?feed=job_feed,https://www.higheredjobs.com/rss/articleFeed.cfm
WORKER_CONCURRENCY=3
BATCH_SIZE=50
PORT=10000   # Render assigns

Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/api

🔮 Future Improvements (Scalable Features)
🚀 Priority Enhancements

Add dead-letter queue (DLQ) for failed jobs

Add SSE or WebSockets for real-time import progress updates

Add filtering, search, and pagination in admin UI

Compute hash-based change detection instead of field comparisons

Add rate limiting and better retry strategies for external feeds

Split processors into microservices (fetcher → producer → worker)

💾 Database Improvements

Add indexing for title, company, and location

Add analytics collection to store daily job counts

🔐 Security Enhancements

Add authentication to admin panel

Restrict CORS to production domains

Move secrets to encrypted env vaults

📝 Conclusion

This project demonstrates a full real-world scalable architecture:

External job ingestion

XML → JSON conversion

Queue-based batch processing

Database upserts

History tracking

Cron scheduling

Admin dashboard