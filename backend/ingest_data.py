import json
import os
import sys

try:
    from sentence_transformers import SentenceTransformer
    from qdrant_client import QdrantClient
    from qdrant_client.models import PointStruct, VectorParams, Distance
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    print("Please run: pip install sentence-transformers qdrant-client")
    sys.exit(1)

# Configuration
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
COLLECTION_NAME = "golden_runs"
MODEL_NAME = "all-MiniLM-L6-v2"
VECTOR_SIZE = 384 # 384 dimensions for all-MiniLM-L6-v2

def main():
    print(f"🚀 Initializing Ingestion for {COLLECTION_NAME}...")

    # 1. Initialize Qdrant Client
    try:
        client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
        # Check connection implicitly by performing an operation
        client.get_collections()
        print(f"✅ Connected to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}")
    except Exception as e:
        print(f"❌ Failed to connect to Qdrant: {e}")
        print("Ensure Qdrant is running (docker run -p 6333:6333 qdrant/qdrant)")
        sys.exit(1)

    # 2. Load Data
    data_path = "backend/training_data.json"
    if not os.path.exists(data_path):
        print(f"❌ Data file not found at {data_path}")
        sys.exit(1)

    with open(data_path, "r") as f:
        data = json.load(f)
    print(f"📂 Loaded {len(data)} records from {data_path}")

    # 3. Initialize Model
    print(f"🧠 Loading SentenceTransformer model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)

    # 4. Recreate Collection
    print(f"🗑️  Recreating collection '{COLLECTION_NAME}' with size {VECTOR_SIZE}...")
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
    )

    # 5. Vectorize and Prepare Points
    print("⚡ Vectorizing and preparing batches...")
    points = []
    
    # Batch processing for encoding is faster
    descriptions = [item["description"] for item in data]
    embeddings = model.encode(descriptions, show_progress_bar=True)

    for i, (item, vector) in enumerate(zip(data, embeddings)):
        points.append(PointStruct(
            id=i,
            vector=vector.tolist(),
            payload=item
        ))

    # 6. Upload to Qdrant
    print(f"⬆️  Uploading {len(points)} points to Qdrant...")
    client.upload_points(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    print("✅ Ingestion Complete! Data is now searchable.")

if __name__ == "__main__":
    main()