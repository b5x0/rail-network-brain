from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qdrant_client import QdrantClient, models
from qdrant_client.models import PointStruct
from utils.embedding import get_vector
from engine import simulation
import os
import uuid

app = FastAPI(title="RailBrain: Neural Search", version="4.0-NEURAL")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# Initialize Qdrant and Embedding Model Globaly
print("🚀 Connecting to Qdrant...")
client = QdrantClient(host="localhost", port=6333)
COLLECTION_NAME = "golden_runs"

# No more LLM loading!
# print("🧠 Loading Embedding Model (all-MiniLM-L6-v2)...")
# embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Brain is ready (Numeric Mode).")

class ResolutionRequest(BaseModel):
    alert_id: str
    train_id: str
    action: str

@app.get("/get_options")
def get_options(train_type: str = None):
    active_alert = next((a for a in simulation.state["alerts"] if not a["resolved"]), None)
    if not active_alert: return []

    victim_id = active_alert["trains"][0]
    victim_train = simulation.state["trains"].get(victim_id, {})
    location = active_alert["location"]
    
    # Context Awareness: Use filtered train_type or derive from state
    if not train_type:
         train_type = victim_train.get('type')

    # 1. Context Construction & Vectorization
    # ... (existing telemetry extraction) ...
    current_speed_abstract = victim_train.get('current_speed', 0)
    current_speed_kmh = current_speed_abstract * 300 

    vector = get_vector(
        speed_kmh=current_speed_kmh,
        location=location,
        weather="Clear",
        train_id=victim_id
    )

    # 2. Vector Search with Context Filtering
    # Only recall memories relevant to this specific train type (Safety)
    query_filter = None
    if train_type:
        query_filter = models.Filter(
            must=[
                models.FieldCondition(
                    key="train_type",
                    match=models.MatchValue(value=train_type)
                )
            ]
        )

    hits = client.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        query_filter=query_filter,
        limit=15 
    ).points
    
    # 3. Diversity Re-Ranking (MMR Logic)
    unique_actions = set()
    final_options = []
    
    for hit in hits:
        action = hit.payload.get("action_taken")
        if not action: continue
        
        if action not in unique_actions:
            unique_actions.add(action)
            
            # Confidence based on vector similarity score
            confidence = round(hit.score * 100)
            
            final_options.append({
                "action": action,
                "train": victim_id,
                "confidence": confidence,
                "desc": hit.payload.get("description", "Historical match found."),
                "pros": f"Similar incident: {hit.payload.get('incident_type', 'Unknown')}",
                "cons": "Requires manual confirmation."
            })
            
        if len(final_options) >= 3:
            break
            
    # Fallback if we don't have enough options
    if len(final_options) < 3:
        fallbacks = [
            {"action": "Hold", "desc": "Standard safety stop.", "pros": "Safe.", "cons": "Delays."},
            {"action": "Reroute", "desc": "Reverse to clear block.", "pros": "Clears hub.", "cons": "Major delay."},
            {"action": "Slow Down", "desc": "Reduce speed.", "pros": "Efficient.", "cons": "Risk."}
        ]
        
        existing = {o["action"] for o in final_options}
        for fb in fallbacks:
            if fb["action"] not in existing and len(final_options) < 3:
                final_options.append({
                    "action": fb["action"],
                    "train": victim_id,
                    "confidence": 50,
                    "desc": fb["desc"],
                    "pros": fb["pros"],
                    "cons": fb["cons"]
                })

    # 4. Explainable Veto (Safety Layer)
    # Split results into Recommended vs Rejected based on Physics
    response = {"recommended": [], "rejected": []}
    
    for opt in final_options:
        is_safe, reason = simulation.is_action_safe(opt["train"], opt["action"])
        if is_safe:
            response["recommended"].append(opt)
        else:
            opt["reason"] = reason
            response["rejected"].append(opt)
            
    return response

@app.post("/execute_option")
def execute_option(req: ResolutionRequest):
    # RLHF: One-Shot Learning Loop
    # 1. Capture Context BEFORE resolution (while alert is active)
    active_alert = next((a for a in simulation.state["alerts"] if a["id"] == req.alert_id), None)
    
    if active_alert:
        train_id = req.train_id
        train = simulation.state["trains"].get(train_id, {})
        location = active_alert["location"]
        # Simplified weather capture (assuming 'Rainy' for now or extended state later if needed, 
        # but prompt asked for specific string format)
        weather = "Clear" # Default for now as weather isn't in alert directly, but good for template
        
        # Format: "{alert_type} for {train_id} at {location} in {weather} weather. Human Operator action: {action_chosen}."
        description = f"Collision for {train_id} at {location} in {weather} weather. Human Operator action: {req.action}."
        
        # 2. Vectorise
        print(f"🧮 Vectorising human feedback: {description}")
        
        # We need speed_kmh for the new vectorizer.
        # Assuming we can get it from train state or req? train state has 'current_speed'
        current_speed_kmh = train.get('current_speed', 0) * 300

        vector = get_vector(
            speed_kmh=current_speed_kmh,
            location=location,
            weather=weather,
            train_id=train_id
        )
        # vector = embedding_model.encode(description).tolist()
        
        # 3. Upsert to Qdrant (Golden Runs)
        point_id = str(uuid.uuid4())
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "train_id": train_id,
                        "action_taken": req.action,
                        "location": location,
                        "description": description,
                        "incident_type": "Collision",
                        "source": "human_feedback"
                    }
                )
            ]
        )
        print(f"[LEARNING LOOP] 🧠 Human feedback received. Upserted new strategy for Collision. AI is now smarter.")

    with simulation.lock:
        simulation.apply_resolution(req.train_id, req.action)
    return {"status": "executed"}

@app.get("/simulation/state")
def state(): return simulation.get_state()

@app.get("/stats")
def stats():
    vetoes = simulation.state.get("veto_count", 0)
    # Count resolved alerts
    resolved = len([a for a in simulation.state["alerts"] if a["resolved"]])
    
    # Calculate Metrics
    reliability = 100 - (vetoes * 2)
    
    # Satisfaction: Base 100, -5 per veto, +0.5 per resolved
    # Clamp max 100
    satisfaction = 100 - (vetoes * 5) + (resolved * 0.5)
    satisfaction = max(0, min(100, satisfaction))
    
    # Real Energy: Convert Joules to MWh
    # 1 Joule = 2.77778e-10 MWh
    total_joules = simulation.state.get("total_energy_saved_joules", 0)
    energy_mwh = total_joules * 2.77778e-10
    
    # Format dynamically: kWh if small, MWh if large
    if energy_mwh < 1.0:
        energy_kwh = total_joules / 3.6e6
        energy_saved = f"{energy_kwh:.1f} kWh"
    else:
        energy_saved = f"{energy_mwh:.1f} MWh"
    
    return {
        "reliability": reliability,
        "energy_saved": energy_saved,
        "satisfaction": satisfaction,
        "veto_count": vetoes
    }

@app.post("/simulation/start")
def start(): simulation.start()

@app.post("/simulation/stop")
def stop(): simulation.stop()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)