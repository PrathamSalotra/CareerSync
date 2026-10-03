# CareerSync

An advanced, AI-powered career opportunity platform designed to intelligently bridge the gap between job seekers and their ideal roles.

## Why We Built CareerSync
In today's highly competitive job market, candidates often struggle to manually parse through thousands of job listings to find the perfect fit for their exact skillset. **CareerSync** was created to automate and elevate this process. 

By leveraging cutting-edge Large Language Models (LLMs) and high-dimensional Vector Search, CareerSync analyzes a user's resume, understands their deeply rooted technical skills and experiences, and automatically fetches, ranks, and provides actionable insights on real-time job listings that perfectly align with their profile.

## Architecture
CareerSync uses a decoupled, containerized Client-Server architecture:
*   **Client:** A lightning-fast Single Page Application (SPA) built with React and Vite. It communicates with the backend via a REST API and is served in production via an ultra-lightweight **Nginx** web server.
*   **Server:** A robust Node.js and Express backend that orchestrates the AI logic, database interactions, and external API integrations.
*   **Vector Search & AI:** Resumes are parsed, converted into vector embeddings via **Google GenAI**, and stored in a **Pinecone Vector Database** for instantaneous semantic similarity matching against job descriptions.
*   **CI/CD Pipeline:** Fully automated via **GitHub Actions**. Pushes to the `main` branch trigger tests, builds, and automatic publishing of optimized Docker images to the GitHub Container Registry (GHCR).

## Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | Component-based UI with blazing-fast HMR and optimized builds. |
| **Routing** | React Router DOM v7 | Client-side routing for the SPA. |
| **Styling** | Vanilla CSS | Pure CSS utilizing CSS Variables, Flexbox, and Grid for a lightweight footprint. |
| **Backend Runtime** | Node.js 20 | Non-blocking, event-driven JavaScript runtime. |
| **Backend Framework** | Express.js | Minimalist web framework for building the REST API. |
| **Database** | MongoDB & Mongoose | NoSQL database with strict schema validation at the application layer. |
| **Validation** | Zod | TypeScript-first schema declaration and validation. |
| **Authentication** | JWT & bcrypt | Secure, HttpOnly cookie-based dual-token authentication. |
| **Containerization** | Docker & Docker Compose | Containerized environments for parity across local and production setups. |
| **Web Server / Proxy** | Nginx | High-performance static asset server and reverse proxy for the frontend container. |
| **External APIs** | Adzuna API | Aggregates and provides real-time job market data. |
| **AI Models** | Google GenAI (Gemini) | Generates vector embeddings and unstructured text analysis. |
| **Vector DB** | Pinecone | Stores and queries high-dimensional vector embeddings for semantic matching. |
| **Object Storage** | Cloudflare R2 | S3-compatible storage for securely retaining user PDF resumes. |
| **Transactional Email** | Resend / Nodemailer | Handles OTPs, password resets, and automated communications. |

## Database Models
CareerSync's MongoDB architecture utilizes the following models:

1.  **User Model:**
    *   Handles secure authentication credentials.
    *   Enforces platform quotas (e.g., maximum 3 active resumes, 10 searches per 24 hours).
2.  **Resume Model:**
    *   Stores references to the physical PDF files stored in Cloudflare R2.
    *   Contains the raw parsed text of the resume.
    *   Tracks the Pinecone Vector ID for semantic search capabilities.
3.  **Search History Model:**
    *   Logs the user's historical job queries.
    *   Stores the AI-generated insights and match scores for specific job opportunities so users can revisit past analyses.
4.  **RefreshToken Model:**
    *   Stores cryptographically hashed, long-lived refresh tokens.
    *   Allows the server to explicitly revoke sessions and enforces a secure dual-token authentication flow.
5.  **PasswordResetToken Model:**
    *   Temporarily stores short-lived OTPs or tokens used for account recovery.
    *   Automatically expires via TTL (Time-To-Live) indexes to ensure security.

---

## Installation & Cloning Process

### Prerequisites
*   [Git](https://git-scm.com/)

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/CareerSync.git
cd CareerSync
```

### Step 2: Configure Environment Variables
The project relies on external APIs (MongoDB, Pinecone, Google GenAI, Adzuna, etc.). 
*   Duplicate the `.env.docker` file located in the root directory.
*   Rename the duplicated file to `.env`.
*   Open the new `.env` file and fill in your actual API keys and MongoDB connection string.

---

### Option A: Running with Docker (Recommended)
Thanks to our fully containerized setup, running CareerSync locally via Docker handles all dependencies automatically.

**Prerequisites for Option A:**
*   [Docker Desktop](https://www.docker.com/products/docker-desktop)

**1. Update Docker Compose (If necessary)**
If you named your file `.env` in the root directory, ensure your `docker-compose.yml` is pointing to it. 

**2. Build and Run the Containers**
Use Docker Compose to build the images and spin up the entire stack:
```bash
docker compose up --build -d
```
*The `-d` flag runs the containers in detached mode (in the background).*

**3. Access the Application**
Once the build is complete, the application will be running live on your machine!
*   **Frontend Client:** Open [http://localhost](http://localhost) in your browser.
*   **Backend API:** The Nginx reverse proxy routes API calls through `http://localhost/api/...` securely to the backend.

**4. Shutting Down**
To stop the application and gracefully shut down the containers, run:
```bash
docker compose down
```

---

### Option B: Local Ecosystem Installation (Without Docker)
If you prefer to run the application manually on your local machine without Docker, follow these steps.

**Prerequisites for Option B:**
*   [Node.js](https://nodejs.org/) (v20+ recommended)
*   A running MongoDB instance (or MongoDB Atlas URI)

**1. Move Environment Variables**
When running locally, the server looks for the `.env` file directly inside the `server/` directory. Move or copy your root `.env` file into the `server/` folder.

**2. Install Server Dependencies & Start**
Open a terminal and navigate to the backend directory:
```bash
cd server
npm install
npm run dev
```
*The backend will now be running on `http://localhost:5000`.*

**3. Install Client Dependencies & Start**
Open a **new** terminal window and navigate to the frontend directory:
```bash
cd client
npm install
npm run dev
```
*The frontend will now be running on `http://localhost:5173`.*

**4. Access the Application**
Open your browser and navigate to `http://localhost:5173`. The Vite development server automatically proxies `/api` requests to your local backend at port 5000 via its `vite.config.js` settings.
