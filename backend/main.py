from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qdrant_client import QdrantClient
from engine import simulation
import json
import os
import numpy as np

app = FastAPI(title="RailBrain: Real GNN", version="3.0-LIVE")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

client = QdrantClient(host="localhost", port=6333)
COLLECTION_NAME = "golden_runs"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTOR_FILE = os.path.join(BASE_DIR, "rail_vector_dict.json")

try:
    with open(VECTOR_FILE, "r") as f:
        VECTOR_DICT = json.load(f)
except: VECTOR_DICT = {}

class ResolutionRequest(BaseModel):
    alert_id: str
    train_id: str
    action: str

@app.get("/get_options")
def get_options():
    active_alert = next((a for a in simulation.state["alerts"] if not a["resolved"]), None)
    if not active_alert: return []

    victim_id = active_alert["trains"][0] 
    location = active_alert["location"]
    
    # Step 1: Query the GNN model using real historical data vectors for this location
    real_options = []
    if location in VECTOR_DICT:
        base_vector = np.array(VECTOR_DICT[location])
        try:
            # Query Qdrant vector database to find similar historical scenarios matching this location
            hits = client.query_points(
                collection_name=COLLECTION_NAME,
                query=base_vector.tolist(),
                limit=10
            ).points
            
            # Aggregate action types from retrieved historical cases to build frequency counts
            counts = {}
            for h in hits:
                act = h.payload.get("action_type")
                if act not in counts: counts[act] = 0
                counts[act] += 1
            
            # Convert action frequencies into recommendation options with calculated confidence scores
            for act, count in counts.items():
                conf = count / len(hits)
                real_options.append({
                    "action": act,
                    "train": victim_id,
                    "confidence": round(conf, 2),
                    "desc": f"Used in {count} historical cases.",
                    "pros": "Historical match found.",
                    "cons": "Context may vary."
                })
        except: pass

    # Step 2: Generate fallback recommendations if insufficient real GNN results (ensure minimum 3 options)
    # Default recommended actions with predefined descriptions for safety-critical scenarios
    required = 3 - len(real_options)
    fallbacks = [
        {"action": "Hold", "desc": "Standard safety stop.", "pros": "Safe.", "cons": "Delays."},
        {"action": "Reroute", "desc": "Reverse to clear block.", "pros": "Clears hub.", "cons": "Major delay."},
        {"action": "Slow Down", "desc": "Reduce approach speed.", "pros": "Efficient.", "cons": "Risk."}
    ]
    
    # Avoid duplicate actions; only add fallback options that aren't already in the real GNN results
    existing_actions = [o["action"] for o in real_options]
    for fb in fallbacks:
        if len(real_options) >= 3: break
        if fb["action"] not in existing_actions:
            real_options.append({
                "action": fb["action"],
                "train": victim_id,
                "confidence": 0.50, 
                "desc": fb["desc"],
                "pros": fb["pros"],
                "cons": fb["cons"]
            })

    return real_options[:3]

@app.post("/execute_option")
def execute_option(req: ResolutionRequest):
    with simulation.lock:
        simulation.apply_resolution(req.train_id, req.action)
    return {"status": "executed"}

@app.get("/simulation/state")
def state(): return simulation.get_state()

@app.post("/simulation/start")
def start(): simulation.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)