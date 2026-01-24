#  Constraint-Aware AI Rail Network Brain

> **Status:** Active Development (Hackathon Mode)
> **Goal:** A "Safety-First" AI that prevents railway conflicts using Hybrid Vector Search.

##  Project Structure
* **`/backend`**: The Logic. Python API that connects to Qdrant.
    * `engine.py`: The core "Conflict Resolution" logic.
* **`/frontend`**: The Dashboard. A React/Streamlit app for the "End-to-End Demo."
* **`/data_generator`**: Scripts to create the "Synthetic History" (Golden Runs).

##  Quick Start
1.  **Clone the repo:** `git clone ...`
2.  **Pick your squad:**
    * *Backend:* `cd backend`
    * *Frontend:* `cd frontend`
3.  **Install dependencies:** `pip install -r requirements.txt`

##  The Golden Rules (Read Before Coding!)
1.  **NO PUSHING TO MAIN.**
    * Always create a branch: `git checkout -b feature/my-task-name`
2.  **Pull Requests (PRs) Required.**
    * When you are done, push your branch and open a PR on GitHub.
3.  **Communication.**
    * Backend logic discussions -> Discord `#dev-backend`
    * UI/Map discussions -> Discord `#dev-frontend`

##  Architecture
We use a **Hybrid Search** strategy:
1.  **Vector Search:** Finds *topologically similar* problems (e.g., "Bottleneck").
2.  **Payload Filtering:** Enforces *physical safety* (e.g., "Train must fit in siding").
