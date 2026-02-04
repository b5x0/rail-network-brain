import random
import uuid
from qdrant_client import QdrantClient, models
from qdrant_client.models import PointStruct, VectorParams, Distance
from utils.embedding import get_vector

# Configuration
COLLECTION_NAME = "golden_runs"
VECTOR_SIZE = 16

def generate_synthetic_baseline(n=1000):
    """
    Generates synthetic 'Safe Baseline' memory to solve Cold Start problem.
    Creates N valid telemetry vectors with safe default actions.
    """
    print(f"🏭 Generating {n} synthetic safety records...")
    
    client = QdrantClient(host="localhost", port=6333)
    
    # Ensure collection exists (idempotent check)
    if not client.collection_exists(COLLECTION_NAME):
        print("⚠️ Collection not found. Creating new...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            quantization_config=models.BinaryQuantization(
                binary=models.BinaryQuantizationConfig(always_ram=True)
            )
        )

    points = []
    
    train_types = ["Passenger_HighSpeed", "Freight_Heavy", "Metro_Light", "Regional_Standard"]
    locations = ["Red_Start", "S-1", "S_2", "Blue_WP1", "Tunis_Central", "Sousse_Central"]
    weathers = ["Clear", "Rain", "Fog", "Windy"]
    
    for i in range(n):
        # Procedural Generation of Telemetry
        speed = random.randint(0, 300)
        loc = random.choice(locations)
        weather = random.choice(weathers)
        t_type = random.choice(train_types)
        t_id = f"SYN-{random.randint(100, 999)}"
        
        # Rule-based "Safe Labeling" logic
        if speed > 100:
            action = "Slow Down"
            desc_action = "reduced speed due to high velocity"
        elif "Central" in loc:
            action = "Hold"
            desc_action = "held at central station"
        else:
            action = "Hold" # Default safe action
            desc_action = "executed safety stop"
            
        description = f"Synthetic: {t_type} {desc_action} at {loc} in {weather} weather."
        
        # Vectorize
        vector = get_vector(
            speed_kmh=float(speed),
            location=loc,
            weather=weather,
            train_id=t_id
        )
        
        points.append(PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "train_id": t_id,
                "train_type": t_type,
                "action_taken": action,
                "location": loc,
                "speed_kmh": speed,
                "weather": weather,
                "description": description,
                "incident_type": "Synthetic Safety Baseline",
                "source": "synthetic_generator"
            }
        ))
        
    print(f"⬆️  Upserting {len(points)} synthetic memories to Qdrant...")
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    print("✅ Synthetic Baseline Generation Complete.")

if __name__ == "__main__":
    generate_synthetic_baseline()
