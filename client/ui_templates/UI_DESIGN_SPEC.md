# CareerSync: Functional Specification


## 1. Landing Page (`/`)

**Goal:** Get the user to understand the tool instantly and sign up.

**Design & Layout:**
- **Hero Section:** Centered, massive headline (e.g., "Find Your Match"). A single, brief subtitle.
- **Action:** One prominent "Get Started" button in the center.
- **Visuals:** A clean, borderless screenshot or simple illustration of the app's core feature (the match score) below the button. No walls of text explaining features.

**Functionality & Options:**
- **Navigation Bar:** "Login" and "Sign Up" links. (Clean, no background).
- **"Get Started" Button:** Routes the user to the Sign Up page.

---

## 2. Authentication Flow (`/login`, `/signup`, `/forgot-password`, `/reset-password`)

**Goal:** Secure, frictionless entry.

**Design & Layout:**
- **Single Column Layout:** A centered, narrow form on a completely blank background. No split screens, no distracting imagery.
- **Form Design:** Only essential input fields. Use placeholder text instead of heavy labels, or floating labels that are very small.
- **Buttons:** Full-width primary button for submission.

**Functionality & Options:**
- **Inputs:** Email, Password (with a simple toggle to show/hide password).
- **Links:** "Forgot Password?" below the login form. "Don't have an account?" link to swap between login and signup.
- **Error States:** Brief, red inline text below the specific field that failed.

---

## 3. Dashboard (`/dashboard`)

**Goal:** A quick launching pad for core actions.

**Design & Layout:**
- **Top Bar:** Simple greeting ("Hello, [Name]") and a clean user avatar/menu in the top right.
- **Main Area:** Two massive, clean action cards side-by-side (or stacked on mobile). Very little text.

**Functionality & Options:**
- **Action 1: "Upload Resume"** (Navigates to `/resumes`).
- **Action 2: "New Search"** (Opens a simple modal or navigates to a search page).
- **Recent Activity:** A small, simple list below the main actions showing the last 3 searches (Clickable to view results).

---

## 4. Resume Manager (`/resumes`)

**Goal:** Manage uploaded documents simply.

**Design & Layout:**
- **Upload Zone:** A large, simple dashed rectangle in the center of the screen reading "Drop Resume Here" or "Click to Browse".
- **List View:** Uploaded resumes appear below as clean, single-line rows (not heavy cards).

**Functionality & Options:**
- **Upload:** Drag-and-drop or click to open file browser. Enforces PDF limit.
- **Resume Row:** 
  - Displays: File name / Parsed Job Title.
  - Option: "View Details" (shows parsed skills).
  - Option: "Delete" (icon).

---

## 5. The Search Analyzer (`/results/:searchId`)

**Goal:** Present AI analysis cleanly without overwhelming the user.

**Design & Layout:**
- **Two-Column Split:** 
  - **Left (Jobs):** A simple scrolling list of job titles and company names.
  - **Right (Analysis):** The detailed view for the selected job.
- **Data Presentation:** Avoid dense paragraphs. Use simple visual indicators (like a circular progress bar for "Match Score") and short bullet points.

**Functionality & Options:**
- **Job List (Left):** Click any job to update the right panel.
- **Analysis (Right):**
  - **Match Score:** A simple big number (e.g., "85% Match").
  - **Why it fits:** 3 short bullet points.
  - **What's missing:** 3 short bullet points.
  - **Action:** A simple "View Job Post" link/button.

---

## 6. Search History (`/history`)

**Goal:** Review past activity.

**Design & Layout:**
- **List View:** A minimalist, plain-text list grouped by date (e.g., "Today", "Yesterday"). No heavy tables or borders.

**Functionality & Options:**
- **History Items:** Display the search query (e.g., "Software Engineer in NY").
- **Action:** Clicking the item re-opens that specific Search Analyzer view.

---

## 7. Settings & Account (`/settings`)

**Goal:** Manage account details safely.

**Design & Layout:**
- **Single Column:** Centered, similar to the Auth flow. Clean headings.

**Functionality & Options:**
- **Change Password:** Simple form (Current, New, Confirm).
- **Delete Account:** A distinct text link at the very bottom (styled in a subtle red). Clicking it opens a minimalist confirmation prompt.
