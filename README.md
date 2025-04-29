Movie API – CRUD Project with Postman Tests
A simple local REST API for managing movies, actors, and reviews, built with Node.js, Express, and LowDB.
Designed for learning and testing RESTful CRUD operations and Postman automation, including validation and API key authorization.

🚀 Features
Full CRUD support for:

/movies

/actors

/reviews

Built-in data validation (e.g. required fields, proper formats, ID existence)

API key authorization

Postman collection with:

All requests and automated tests

End-to-end test flow combining all endpoints

Easy to run locally (no DB server needed)

📁 Folder Structure
.
├── index.js                 # Express server setup
├── middleware/
│   └── apiKeyAuth.js        # API key middleware
├── routes/
│   ├── actors.js
│   ├── movies.js
│   ├── reviews.js
│   └── db.json              # LowDB data file
├── postman/
│   ├── Movies API.postman_collection.json
│   ├── Movies API - E2E.postman_collection.json
│   └── Movies API.postman_environment.json
├── README.md
└── package.json

✅ Validation Rules
🎥 Movies
title: required

year: number

director: required

genres: array of strings

rating: number between 0 and 10

👨‍🎤 Actors
first_name, last_name: required

movies: array of existing movie IDs

📝 Reviews
reviewer: required, min 1 character

content: min 5 characters

rating: number between 0 and 10

date: valid date string (e.g. "2025-04-16")

🔐 Authorization (API Key)
All endpoints require an API key

You can modify the key in middleware/apiKeyAuth.js.

🛠️ Installation & Local Setup
1. Clone the Repository
git clone https://github.com/your-username/movie-api.git
cd movie-api
2. Install Dependencies
npm install
3. Run the Server
npm run dev
Server runs by default at: http://localhost:3000

📬 Postman Setup
Import the following files (from /postman directory):
Collections: Movies API.postman_collection.json
             Movies API - E2E.postman_collection.json

Environment: Movie API.postman_environment.json

Make sure the BASE_URL variable in Postman is set to http://localhost:3000.

🧪 Run End-to-End Tests
The Postman collection tests the full lifecycle:

Create a movie

Create an actor linked to that movie

Create a review for the movie

Update actor and movie

Validate changes

Delete all resources

Confirm they no longer exist
