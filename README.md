📝 Task Management API
A simple Task Management REST API built with Express.js, TypeScript, MongoDB, JWT Authentication, and Redis Caching.

📦 Features
User Registration and Login with JWT

CRUD operations for Tasks

Role-based Authorization (only admins can delete tasks)

Request Validation using express-validator

MongoDB (Mongoose models with relations)

Redis Caching for task listing

Dockerized for easy deployment

Request logging middleware

Proper error handling and status codes

Postman collection included for easy testing 🚀

🛠️ Tech Stack
Node.js + Express.js

TypeScript

MongoDB + Mongoose

JWT for Authentication

Redis for Caching

Docker for Containerization

express-validator for Validation

📂 Project Structure
css
Copy
Edit
src/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
├── app.ts
└── server.ts
🚀 Getting Started

1. Clone the repo
   bash
   Copy
   Edit
   git clone https://github.com/your-username/task-management-api.git
   cd task-management-api
2. Install dependencies
   bash
   Copy
   Edit
   npm install
3. Set up environment variables
   Create a .env file (see .env.example):

bash
Copy
Edit
cp .env.example .env
Fill in the required variables:

ini
Copy
Edit
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379 4. Start Redis (local or Docker)
bash
Copy
Edit
docker run -p 6379:6379 redis 5. Run the application
bash
Copy
Edit
npm run dev
The API will run at: http://localhost:5000

🧪 API Testing
Import the provided Postman Collection:

👉 Postman Collection Link (Add your exported collection link here)

or use the file: /postman/Task-Management-API.postman_collection.json

📖 API Endpoints

Method Endpoint Description Auth Required Admin Only
POST /auth/register Register a new user No No
POST /auth/login Login and get JWT No No
POST /tasks Create a new task Yes No
GET /tasks/:id Get task by ID Yes No
GET /tasks Get all tasks (with filters) Yes No
PUT /tasks/:id Update a task Yes No
DELETE /tasks/:id Delete a task Yes Yes
🗃️ Sample MongoDB Data
Sample data for testing is available in /sample-data/sample.json.

You can import it into your MongoDB using:

bash
Copy
Edit
mongoimport --uri YOUR_MONGODB_URI --collection users --file sample-data/sample.json --jsonArray
🔒 Authentication and Authorization
After registration or login, a JWT token is returned.

Include this token in the Authorization header:

makefile
Copy
Edit
Authorization: Bearer YOUR_TOKEN_HERE
Only users with the role admin can delete tasks.

⚡ Caching (Redis)
GET /tasks responses are cached for 60 seconds.

Cache is automatically invalidated when a task is created, updated, or deleted.

🐳 Docker Deployment

1. Build the Docker image
   bash
   Copy
   Edit
   docker build -t task-management-api .
2. Run the container
   bash
   Copy
   Edit
   docker run -p 5000:5000 --env-file .env task-management-api
   ☁️ Deployment
   You can deploy the app easily on platforms like Render, Railway, or Fly.io.

Sample steps for Render:

Create a new Web Service

Connect your GitHub repo

Add environment variables

Choose the build command: npm install && npm run build

Start command: npm run start

Attach a managed Redis instance if needed

📜 Scripts
npm run dev - Run in development mode (nodemon)

npm run build - Build for production

npm run start - Start the app

npm run test - For testing

