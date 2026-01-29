import json
import numpy as np
from qdrant_client import QdrantClient, models
from qdrant_client.models import PointStruct, VectorParams, Distance

# Qdrant vector database configuration
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
COLLECTION_NAME = "golden_runs"  # Vector collection storing historical rail network patterns

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# Step 1: Generate deterministic vector embeddings for each station
# This creates a mapping of station IDs (e.g., "Ariana_Central") to numerical vectors (128-dim).
# These vectors are later used by the API to perform semantic searches on rail network data.
print("🧮 Training Vectors...")

with open("data_generator/infrastructure.json", "r") as f:
    infra = json.load(f)

vector_dict = {}
for i, node in enumerate(infra["nodes"]):
    # Generate a deterministic 128-dimensional vector for each station using a fixed seed.
    # This ensures consistent embeddings across sessions. In production, these would be trained via GNN.
    rng = np.random.default_rng(seed=i) 
    vector = rng.random(128).tolist()
    vector_dict[node["id"]] = vector

# Persist the station-to-vector mapping for use by the API (main.py).
# This allows the API to convert station IDs into vectors without regenerating them.
with open("backend/rail_vector_dict.json", "w") as f:
    json.dump(vector_dict, f)
print("✅ Saved 'rail_vector_dict.json' (The Brain's Index)")

# Step 2: Load historical rail network logs into the Qdrant vector database
# This recreates the collection to ensure a clean slate for storing vector-indexed historical data.
print("🚀 Ingesting to Qdrant...")
client.recreate_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(size=128, distance=Distance.COSINE)  # 128-dim vectors with cosine similarity
)

with open("data_generator/training_data.json", "r") as f:
    logs = json.load(f)

points = []
for i, log in enumerate(logs):
    loc = log["location_id"]
    if loc in vector_dict:
        # Create a point with the station's vector embedding and the full log as metadata (payload).
        points.append(PointStruct(
            id=i,
            vector=vector_dict[loc],
            payload=log
        ))

# Upload points to Qdrant in batches to optimize database performance and prevent timeouts.
BATCH_SIZE = 100
for i in range(0, len(points), BATCH_SIZE):
    batch = points[i : i + BATCH_SIZE]
    client.upsert(collection_name=COLLECTION_NAME, points=batch)

print(f"✅ Successfully ingested {len(points)} memories into Qdrant.")