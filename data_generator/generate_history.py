import json
import random

# --- 1. CONFIGURATION ---

STATION_NAMES = ["Tunis_Central", "Sfax_Junction", "Sousse_North", "Gabes_Terminal", "Bizerte_Port"]
SIGNALING_SYSTEMS = ["ETCS_L1", "ETCS_L2", "Manual_Block"]

# --- 2. TRAIN DEFINITIONS (Now includes Braking & Signaling) ---
TRAIN_DEFINITIONS = [
    {
        "id": "T-101", 
        "type": "Passenger_HighSpeed", 
        "length": 220, 
        "mass": 450, 
        "max_speed": 160, 
        "gauge": "G1", 
        "braking_lambda": 140,    # High braking performance
        "supported_signaling": ["ETCS_L1", "ETCS_L2"] # Can use modern lines
    },
    {
        "id": "T-204", 
        "type": "Freight_Heavy", 
        "length": 750, 
        "mass": 2200, 
        "max_speed": 80, 
        "gauge": "GC", 
        "braking_lambda": 65,     # Poor braking performance
        "supported_signaling": ["Manual_Block", "ETCS_L1"] # Cannot use High Speed L2 lines
    },
    {
        "id": "T-305", 
        "type": "Regional_Commuter", 
        "length": 180, 
        "mass": 300, 
        "max_speed": 120, 
        "gauge": "G1",
        "braking_lambda": 110,
        "supported_signaling": ["ETCS_L1"]
    }
]

# --- 3. INFRASTRUCTURE GENERATOR (Now includes Connectivity) ---

def generate_infrastructure():
    infrastructure = []
    
    # We will chain stations together to form a "Line"
    # Tunis -> Sousse -> Sfax -> Gabes
    previous_station_id = None
    
    for i, station_name in enumerate(STATION_NAMES):
        station_id = f"Station_{station_name}"
        
        # 1. Create Station Node (The "Hub")
        station_node = {
            "id": station_id,
            "type": "Station_Hub",
            "name": f"Gare de {station_name}",
            "location": {"lat": 36.8 - (i * 0.5), "lon": 10.1 + (i * 0.1)}, # Fake coords moving south
            "connected_to": [] # Will be filled with platform IDs
        }
        
        # 2. Create Platforms for this Station
        platforms = []
        num_platforms = random.randint(2, 4)
        for p in range(1, num_platforms + 1):
            platform_id = f"Platform-{station_name}-{p}"
            platform_len = random.choice([150, 300, 400])
            
            platform = {
                "id": platform_id,
                "type": "Platform",
                "station_group_id": station_id,
                "connected_to": [station_id], # Link back to hub
                "payload_constraints": {
                    "usable_length_meters": float(platform_len),
                    "cleared_gauge": "GC" if platform_len > 300 else "G1",
                    "signaling_system": "ETCS_L1", # Platforms usually have standard signaling
                    "is_electrified": True
                }
            }
            infrastructure.append(platform)
            platforms.append(platform_id)
            station_node["connected_to"].append(platform_id)

        infrastructure.append(station_node)

        # 3. Connect to Previous Station via a "Main Line" Track
        if previous_station_id:
            # Create a track segment linking the two stations
            track_id = f"Track-{previous_station_id}-to-{station_id}"
            gradient = random.choice([0.0, 5.0, 12.0, 25.0]) # 25.0 is the trap!
            signaling = random.choice(SIGNALING_SYSTEMS)
            
            track_segment = {
                "id": track_id,
                "type": "MainLine",
                "connected_to": [previous_station_id, station_id], # THE MISSING LINK
                "payload_constraints": {
                    "length_km": random.randint(10, 50),
                    "max_gradient_permille": gradient,
                    "signaling_system": signaling, # The "Digital Key"
                    "max_axle_load_tonnes": 22.5 if gradient < 15 else 30.0
                }
            }
            infrastructure.append(track_segment)
            
        previous_station_id = station_id
            
    return infrastructure

def generate_timetable():
    timetable = []
    for train in TRAIN_DEFINITIONS:
        # Simple route: Visit first 2 stations
        route_stations = STATION_NAMES[:2] 
        start_hour = random.randint(6, 18)
        
        schedule = {
            "train_id": train["id"],
            "train_profile": train, # Contains Braking & Signaling now!
            "route": [
                {
                    "station_id": f"Station_{route_stations[0]}",
                    "arrival": f"{start_hour:02d}:00",
                    "departure": f"{start_hour:02d}:15",
                    "platform_id": f"Platform-{route_stations[0]}-1"
                },
                {
                    "station_id": f"Station_{route_stations[1]}",
                    "arrival": f"{start_hour+1:02d}:30",
                    "departure": f"{start_hour+1:02d}:45",
                    "platform_id": f"Platform-{route_stations[1]}-1"
                }
            ]
        }
        timetable.append(schedule)
    return timetable

# --- 4. EXECUTION ---

def main():
    print("🌍 Generating Connected Rail World...")
    
    infra = generate_infrastructure()
    with open("infrastructure.json", "w") as f:
        json.dump(infra, f, indent=2)
    print(f"✅ Generated {len(infra)} infrastructure nodes with CONNECTIONS.")

    schedule = generate_timetable()
    with open("timetable.json", "w") as f:
        json.dump(schedule, f, indent=2)
    print(f"✅ Generated schedule for {len(schedule)} trains.")

if __name__ == "__main__":
    main()