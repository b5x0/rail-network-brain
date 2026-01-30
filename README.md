# 🚄 Massar: Cognitive Rail Network Operations Center

> **🚀 Neuro-Symbolic AI & Physics-Deterministic Validation Engine**

Massar is an advanced, **Dual-Agent** rail traffic management system designed to detect, analyze, and resolve network conflicts in real-time. It moves beyond simple collision avoidance by integrating **Neural Search** for creative problem solving with a **Deterministic Physics Engine** for absolute safety enforcement.

---

## ⚠️ SYSTEM STATUS: FULL PROTOTYPE
**Current Build:** Phase 5 (RLHF & Business Metrics Complete)
* **Frontend:** Production-Ready **React.js Dashboard** with Glassmorphism UI & Live Stats.
* **Backend:** Multi-Agent Architecture (AI Brain + Physics Safety Layer).
* **Data:** Causal-Deterministic (No random generation).

---

## 🧠 System Architecture: The "Triad" Design

Massar operates on a **Neuro-Symbolic Architecture**, separating creative decision-making from physical safety constraints.

### 1. The Environment: Causal Physics Engine (`backend/engine.py`)
A custom-built, tick-based simulation engine that models **Thermodynamics and Kinematics**, not just movement.
* **Mass/Momentum Logic:** Simulates a 2,400t Freight Train differently from a 60t Metro.
* **Causal Failures:** Incidents are generated via deterministic rules (e.g., `Mass > 2000t` + `High Speed` + `Heat` = **Brake Fade**), creating a realistic "Ground Truth."
* **Dynamic Scheduling:** Real-time calculation of ETAs based on track friction and train power curves.

### 2. Agent 1: "The Watcher" (Deterministic Safety Layer)
The Watcher is a rigid safety agent that acts as the system's "Veto Power."
* **Physics Veto:** Before any AI action is applied, The Watcher calculates the **Stopping Distance** (`d = 0.5 * m * v^2 / F`).
* **The Override:** If the AI suggests "Hold" for a train moving too fast to stop, The Watcher **BLOCKS** the command and forces an **"Emergency Reroute"** to prevent a crash.
* **Predictive Intention Scan:** Analyzes trajectory vectors to flag conflicts *before* they violate block signaling.

### 3. Agent 2: "The Brain" (Neural Search & RLHF) (`backend/main.py`)
When a conflict is detected, The Brain generates strategic resolutions using **Vector Search**.
* **Semantic Embeddings:** Uses **`all-MiniLM-L6-v2`** (384-d vectors) to understand incident context (e.g., equating "Ice" with "Hydroplaning").
* **MMR (Maximal Marginal Relevance):** A re-ranking algorithm that ensures diversity. The system proposes distinct strategies (**Hold**, **Slow Down**, **Reroute**) rather than duplicate options.
* **RLHF (Learning Loop):** Implements **One-Shot Learning**. When a human operator manually resolves a conflict, the decision is vectorized and upserted to **Qdrant** instantly, making the system smarter with every interaction.

---

## ⚡ Key Features

### 🛡️ Judge-Proof Safety
* **Dual-Check Validation:** AI optimizes for efficiency; Physics optimizes for survival.
* **Veto Logging:** The system logs every time the Physics Agent overrides the AI, tracking "Near Misses."

### 📊 Business Value Dashboard
A real-time "Glassmorphism" panel tracking KPIs:
* **⚡ Energy Saved:** Calculated dynamically based on momentum preservation (avoiding stops saves MWh).
* **😊 Passenger Satisfaction:** Penalized by "Jerky" Safety Vetoes, rewarded by smooth AI resolutions.
* **🛡️ Reliability:** Real-time system resolution rate.

### 🔍 Qdrant Graph Knowledge
* **HNSW Indexing:** Utilizes Hierarchical Navigable Small World graphs for sub-millisecond retrieval of historical scenarios.
* **Rich Payload Filtering:** Combines vector similarity with hard constraints (e.g., "Must be Freight compatible").

---

## 🛠️ Technology Stack

* **Backend:** Python 3.11+, FastAPI (Async/Await)
* **Frontend:** React.js, Vite
* **Vector Database:** Qdrant (HNSW Graph Index)
* **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2`
* **Simulation:** Custom Physics-Deterministic Python Engine

---

## 🚀 Installation & Usage

### Prerequisites
* Node.js & npm
* Python 3.10 or higher
* Qdrant (Running locally on port 6333)

### 1. Setup Backend
```bash
git clone [https://github.com/your-org/rail-brain.git](https://github.com/your-org/rail-brain.git)
cd rail-brain

# Install Python dependencies
pip install -r backend/requirements.txt

# Start the Neuro-Symbolic Backend
python backend/main.py

```

*The API will start at `http://localhost:8000`.*

### 2. Start the Vector Database (Qdrant)

Ensure Qdrant is running via Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant

```

### 3. Launch the Frontend Command Deck

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the React Dashboard
npm run dev

```

*Open the localhost URL provided (usually `http://localhost:5173`).*

### 4. Running the Demo

* **Step 1:** Click **INITIALIZE SCHEDULE** to start the physics simulation.
* **Step 2:** Watch the **Stats Panel** update in real-time.
* **Step 3:** When a conflict occurs, resolve it and watch the **Console Logs** for the `[LEARNING LOOP]` message.

---

## 📚 API Documentation

* **Docs:** `http://localhost:8000/docs`
* **Redoc:** `http://localhost:8000/redoc`
* **Stats Endpoint:** `GET /stats`

---

## 🔮 Roadmap (Completed)

* [x] **Phase 1:** Physics-Deterministic Data Generation
* [x] **Phase 2:** Neural Search with 384-d Embeddings
* [x] **Phase 3:** MMR Diversity Re-Ranking
* [x] **Phase 4:** Business Metrics Dashboard
* [x] **Phase 5:** RLHF (Human-in-the-Loop Learning)

---

*Engineered for the 2026 Vectors In Orbit Hackathon.*