# CareerSync 🚀

An advanced, AI-powered career opportunity platform designed to intelligently bridge the gap between job seekers and their ideal roles.

## 📖 Why We Built CareerSync
In today's highly competitive job market, candidates often struggle to manually parse through thousands of job listings to find the perfect fit for their exact skillset. **CareerSync** was created to automate and elevate this process. 

By leveraging cutting-edge Large Language Models (LLMs) and high-dimensional Vector Search, CareerSync analyzes a user's resume, understands their deeply rooted technical skills and experiences, and automatically fetches, ranks, and provides actionable insights on real-time job listings that perfectly align with their profile.

## 🏗️ Architecture
CareerSync uses a decoupled, containerized Client-Server architecture:
*   **Client:** A lightning-fast Single Page Application (SPA) built with React and Vite. It communicates with the backend via a REST API and is served in production via an ultra-lightweight **Nginx** web server.
*   **Server:** A robust Node.js and Express backend that orchestrates the AI logic, database interactions, and external API integrations.
*   **Vector Search & AI:** Resumes are parsed, converted into vector embeddings via **Google GenAI**, and stored in a **Pinecone Vector Database** for instantaneous semantic similarity matching against job descriptions.
*   **CI/CD Pipeline:** Fully automated via **GitHub Actions**. Pushes to the `main` branch trigger tests, builds, and automatic publishing of optimized Docker images to the GitHub Container Registry (GHCR).

## 🛠️ Tech Stack
**Frontend**
*   **Framework:** React 19 + Vite
*   **Routing:** React Router DOM v7
*   **Styling:** Modern Vanilla CSS (CSS Variables, Flexbox/Grid)

**Backend**
*   **Runtime:** Node.js 20
*   **Framework:** Express.js
*   **Database:** MongoDB (via Mongoose)
*   **Validation:** Zod
*   **Auth:** JWT (JSON Web Tokens) & bcrypt

**Infrastructure & External APIs**
*   **Containerization:** Docker & Docker Compose
*   **Job Provider:** Adzuna API
*   **AI Models:** Google GenAI (Gemini)
*   **Vector DB:** Pinecone
*   **Object Storage:** Cloudflare R2 (S3 API compatible) for Resume PDFs
*   **Transactional Email:** Resend / Nodemailer

## 🗄️ Database Models
CareerSync's MongoDB architecture is built on three primary models:

1.  **User Model:**
    *   Handles secure authentication.
    *   Enforces platform quotas (e.g., maximum 3 active resumes, 10 searches per 24 hours).
2.  **Resume Model:**
    *   Stores references to the physical PDF files stored in Cloudflare R2.
    *   Contains the raw parsed text of the resume.
    *   Tracks the Pinecone Vector ID for semantic search capabilities.
3.  **Search History Model:**
    *   Logs the user's historical job queries.
    *   Stores the AI-generated insights and match scores for specific job opportunities so users can revisit past analyses without hitting the external APIs twice.

---

## 💻 Installation & Cloning Process

Thanks to our fully containerized Docker setup, running CareerSync locally is incredibly simple. 

### Prerequisites
*   [Git](https://git-scm.com/)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step-by-Step Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-username/CareerSync.git
cd CareerSync
```

**2. Configure the Environment Variables**
The project relies on external APIs (MongoDB, Pinecone, Google GenAI, etc.). We have provided a template file for you.
*   Duplicate the `.env.docker` file located in the root directory.
*   Rename the duplicated file to `.env`.
*   Open the new `.env` file and fill in your actual API keys and MongoDB connection string.

**3. Update Docker Compose (If necessary)**
If you named your file `.env` in the root directory, ensure your `docker-compose.yml` is pointing to it. 
*(If you are running the backend in development mode manually without docker, place the `.env` inside the `/server` folder instead).*

**4. Build and Run the Containers**
Use Docker Compose to build the images and spin up the entire stack:
```bash
docker compose up --build -d
```
*The `-d` flag runs the containers in detached mode (in the background).*

**5. Access the Application**
Once the build is complete, the application will be running live on your machine!
*   **Frontend Client:** Open [http://localhost](http://localhost) in your browser.
*   **Backend API:** The Nginx reverse proxy routes API calls through `http://localhost/api/...` securely to the backend.

### Shutting Down
To stop the application and gracefully shut down the containers, run:
```bash
docker compose down
```
