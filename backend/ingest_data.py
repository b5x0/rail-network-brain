import json
import os
import sys

try:
    from qdrant_client import QdrantClient, models
    from qdrant_client.models import PointStruct, VectorParams, Distance
    from utils.embedding import get_vector
except ImportError as e:
    print(f"❌ Missing dependencies: {e}")
    sys.exit(1)

# Configuration
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
COLLECTION_NAME = "golden_runs"
VECTOR_SIZE = 16 # Normalized Physics Vector

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
    # No LLM needed!
    # print(f"🧠 Loading SentenceTransformer model: {MODEL_NAME}...")
    # model = SentenceTransformer(MODEL_NAME)

    # 4. Recreate Collection
    print(f"🗑️  Recreating collection '{COLLECTION_NAME}' with size {VECTOR_SIZE} (Binary Quantized)...")
    # Using delete + create is safer than recreate_collection (deprecated)
    if client.collection_exists(COLLECTION_NAME):
        client.delete_collection(COLLECTION_NAME)
    
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        # Edge Optimization: Binary Quantization (32x compression, always in RAM)
        quantization_config=models.BinaryQuantization(
            binary=models.BinaryQuantizationConfig(always_ram=True)
        )
    )

    # 5. Vectorize and Prepare Points
    print("⚡ Vectorizing and preparing batches...")
    points = []
    
    for i, item in enumerate(data):
        # Context Extraction: Get 'train_type' from description
        # Format: "{Type} train ({weight})..." -> Split by " train"
        raw_desc = item.get("description", "")
        train_type = raw_desc.split(" train")[0].strip() if " train" in raw_desc else "Unknown"
        
        # Inject extracted type into payload for filtering
        item["train_type"] = train_type

        vector = get_vector(
            speed_kmh=item.get("speed_kmh", 0),
            location=item.get("location", "Unknown"),
            weather=item.get("weather", "Clear"),
            train_id=item.get("train_id", "Unknown")
        )
        points.append(PointStruct(
            id=i,
            vector=vector,
            payload=item
        ))

    # SKIP: Batch processing for encoding is faster
    # descriptions = [item["description"] for item in data]
    # embeddings = model.encode(descriptions, show_progress_bar=True)

    # for i, (item, vector) in enumerate(zip(data, embeddings)):
    #     points.append(PointStruct(
    #         id=i,
    #         vector=vector.tolist(),
    #         payload=item
    #     ))

    # 6. Upload to Qdrant
    print(f"⬆️  Uploading {len(points)} points to Qdrant...")
    client.upload_points(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    print("✅ Ingestion Complete! Data is now searchable.")

if __name__ == "__main__":
    main()