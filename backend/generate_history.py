import random
import uuid
import argparse
import sys
import time
import json
import os
from typing import Generator, List, Dict, Any

try:
    from qdrant_client import QdrantClient, models
    from qdrant_client.models import PointStruct, VectorParams, Distance
    from utils.embedding import get_vector
except ImportError:
    print("❌ Missing dependencies. Please run 'pip install -r backend/requirements.txt'")
    sys.exit(1)

# Configuration
COLLECTION_NAME = "golden_runs"
VECTOR_SIZE = 16

def load_infrastructure() -> Dict[str, List[str]]:
    """Safe loading of infrastructure data."""
    path = "backend/infrastructure.json"
    if not os.path.exists(path):
        print(f"⚠️ Warning: {path} not found. Using fallback locations.")
        return {
            "stations": ["Red_Start", "Blue_WP1"],
            "tracks": ["Track-1", "Track-2"]
        }
    
    with open(path, "r") as f:
        data = json.load(f)
        
    stations = [item["id"] for item in data if item.get("type") in ["Station_Hub", "Platform"]]
    tracks = [item["id"] for item in data if item.get("type") == "MainLine"]
    
    return {"stations": stations, "tracks": tracks}

def generate_smart_batch(batch_size: int, infra: Dict[str, List[str]], operator_id: str) -> List[PointStruct]:
    """
    Generates a batch of SMART synthetic points based on infrastructure rules.
    NO MORE GIGO.
    """
    points = []
    
    train_types = ["Passenger_HighSpeed", "Freight_Heavy", "Metro_Light", "Regional_Standard"]
    weathers = ["Clear", "Rain", "Fog", "Windy", "Snow", "Hot"]
    
    stations = infra["stations"]
    tracks = infra["tracks"]
    
    for _ in range(batch_size):
        # 1. Pick a Context (Station vs Track)
        context_type = "station" if random.random() < 0.4 else "track" # 40% station, 60% track
        
        if context_type == "station" and stations:
            loc = random.choice(stations)
            # Station Logic: Low speed, passenger/door issues
            speed = random.randint(0, 45) 
            incident_pool = ["Door Obstruction", "Passenger Illness", "Signal Delay", "Overcrowding"]
            
            # Overspeed at station scenario (rare but critical)
            if random.random() < 0.05:
                speed = random.randint(50, 120)
                incident_type = "Station Overspeed"
                action = "Emergency Brake"
                desc_action = "emergency braking triggered due to station approach speed"
                severity = "Critical"
            else:
                incident_type = random.choice(incident_pool)
                action = "Hold"
                desc_action = "held at platform"
                severity = "Low"

        elif context_type == "track" and tracks:
            loc = random.choice(tracks)
            # Track Logic: High speed, mechanical/obstacle issues
            speed = random.randint(60, 320)
            incident_pool = ["Obstruction on Track", "Pantograph Damage", "Signal Failure", "Wildlife Crossing"]
            
            incident_type = random.choice(incident_pool)
            
            # Logic based on incident
            if incident_type == "Obstruction on Track":
                action = "Emergency Brake"
                desc_action = "emergency stop initiated"
                severity = "Critical"
            elif incident_type == "Pantograph Damage":
                action = "Coast" # Cut power and coast
                desc_action = "power cut, coasting to safe stop"
                severity = "High"
            else:
                action = "Slow Down"
                desc_action = "reduced speed to cautionary limit"
                severity = "Medium"

        else:
            # Fallback
            loc = "Unknown_Sector"
            speed = 0
            incident_type = "System Error"
            action = "Hold"
            desc_action = "system hold"
            severity = "Low"

        t_type = random.choice(train_types)
        t_id = f"SYN-{random.randint(1000, 9999)}"
        weather = random.choice(weathers)
        
        # Adjust for weather (Physics-ish)
        if weather in ["Rain", "Snow"] and speed > 100:
            action = "Slow Down" # Override to safer action in bad weather
            desc_action = "weather-adjusted speed reduction"

        description = f"{t_type} ({t_id}): {incident_type} at {loc}. Action: {desc_action}. Weather: {weather}. Speed: {speed}km/h."
        
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
                "incident_type": incident_type,
                "description": description,
                "severity": severity,
                "source": "smart_generator_v2",
                "operator_id": operator_id
            }
        ))
    return points

def generate_synthetic_data(count: int, mode: str, upsert: bool, host: str, port: int, operator_id: str) -> None:
    """
    Generates synthetic safety data and optionally upserts to Qdrant.
    """
    print(f"🏭 Starting Smart Generation in {mode.upper()} mode for Operator: {operator_id}.")
    print(f"🎯 Target: {count} records | Upsert: {upsert}")
    
    # Load Real Infrastructure
    infra = load_infrastructure()
    print(f"🗺️  Loaded {len(infra['stations'])} stations and {len(infra['tracks'])} tracks.")

    client = None
    if upsert:
        client = QdrantClient(host=host, port=port)
        
        # Ensure collection exists (idempotent check)
        # For stress tests, we might want to recreate it to start fresh
        if not client.collection_exists(COLLECTION_NAME) or mode == "stress":
            print(f"⚠️ Recreating collection '{COLLECTION_NAME}'...")
            client.recreate_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
                quantization_config=models.BinaryQuantization(
                    binary=models.BinaryQuantizationConfig(always_ram=True)
                )
            )
            print("✅ Collection (re)created with Binary Quantization.")

    total_generated = 0
    batch_size = 1000 
    
    start_time = time.perf_counter()
    
    while total_generated < count:
        current_batch_size = min(batch_size, count - total_generated)
        points = generate_smart_batch(current_batch_size, infra, operator_id)
        
        if upsert and client:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
        
        total_generated += current_batch_size
        
        if total_generated % 10000 == 0 or total_generated == count:
             print(f"⏳ Generated {total_generated}/{count} records...")

    end_time = time.perf_counter()
    duration = end_time - start_time
    rps = count / duration if duration > 0 else 0
    
    print(f"\n✅ Generation Complete!")
    print(f"⏱️  Time taken: {duration:.2f}s")
    print(f"🚀 Speed:      {rps:.0f} records/sec")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="RailBrain Smart Generator")
    parser.add_argument("--count", type=int, default=1000, help="Number of records")
    parser.add_argument("--mode", type=str, choices=["demo", "stress"], default="demo", help="Operation mode")
    parser.add_argument("--upsert", action="store_true", help="Upsert to Qdrant")
    parser.add_argument("--host", type=str, default="localhost", help="Qdrant host")
    parser.add_argument("--port", type=int, default=6333, help="Qdrant port")
    parser.add_argument("--operator", type=str, default="SNCFT", help="Operator ID for Multitenancy")
    
    args = parser.parse_args()
    
    if args.mode == "stress" and args.count == 1000:
        args.count = 100000
        
    generate_synthetic_data(args.count, args.mode, args.upsert, args.host, args.port, args.operator)
