import json
import random

# Step 1: Define the Train Fleet (Hardcoded Physics Attributes)
TRAINS = {
    "T-101": {"type": "Passenger_HighSpeed", "mass": 480, "max_speed_kmh": 300},
    "T-204": {"type": "Freight_Heavy", "mass": 2400, "max_speed_kmh": 100},
    "T-305": {"type": "Regional_Standard", "mass": 110, "max_speed_kmh": 120}, # Assuming sensible max speed for standard
    "T-408": {"type": "Commuter_Rapid", "mass": 320, "max_speed_kmh": 140}, # Assuming sensible max for commuter
    "T-505": {"type": "Metro_Light", "mass": 60, "max_speed_kmh": 80},    # Assuming sensible max for metro
}

# Step 2: Define Valid Locations
LOCATIONS = {
    "Red Line": ["S-1", "S-2", "Red_WP1", "Red_WP2", "Ariana_Central", "Sfax_Central"],
    "Blue Line": ["Tunis_Central", "Blue_WP1", "Blue_WP2", "S-4", "Blue_WP3"],
    "Green Line": ["S-5", "S-6", "S-7"],
    "Orange Line": ["Sousse_Central", "S-3", "Orange_WP1"]
}
# Flatten locations for easier selection
ALL_LOCATIONS = [loc for line in LOCATIONS.values() for loc in line]

WEATHER_CONDITIONS = ["Sunny", "Rain", "Snow", "Hot"]
TIMES_OF_DAY = ["Peak", "Off-Peak"]

# Step 3: Implement Causal Incident Logic
def simulate_scenario(train_type, mass, current_speed, weather, time_of_day):
    """
    Returns incident details if triggers are met, otherwise None.
    """
    
    # 1. The "Momentum" Rule (Freight)
    if train_type == "Freight_Heavy" and current_speed > 90 and weather == "Hot":
        return {
            "incident_type": "Brake System Overheat",
            "severity": "High",
            "action_taken": "Slow Down"
        }
    
    # 2. The "Traction" Rule (Metro/Light)
    if train_type == "Metro_Light" and weather == "Rain" and current_speed > 60:
        return {
            "incident_type": "Wheel Slip Detected",
            "severity": "Medium",
            "action_taken": "Hold"
        }
    
    # 3. The "Passenger" Rule (Commuter)
    if train_type == "Commuter_Rapid" and time_of_day == "Peak":
        return {
            "incident_type": "Door Obstruction",
            "severity": "Low",
            "action_taken": "Hold"
        }
    
    # 4. The "Physics" Rule (Stopping Distance)
    # stopping_dist = (mass * (speed/3.6)**2) / (2 * 10000)
    speed_ms = current_speed / 3.6
    stopping_dist = (mass * (speed_ms ** 2)) / (2 * 10000)
    
    if stopping_dist > 500:
        return {
            "incident_type": "Safe Braking Distance Exceeded",
            "severity": "Critical",
            "action_taken": "Reroute"
        }
        
    return None

def generate_entry():
    # Pick a random train
    train_id = random.choice(list(TRAINS.keys()))
    train_info = TRAINS[train_id]
    
    # Vary parameters reasonably
    # Speed: 0 to 300 (clamped by train's max capability + a bit of overspeed for interest)
    # We allow some overspeed to trigger stopping distance rules
    speed = random.randint(20, 300) 
    
    weather = random.choice(WEATHER_CONDITIONS)
    time_of_day = random.choice(TIMES_OF_DAY)
    location = random.choice(ALL_LOCATIONS)
    
    incident = simulate_scenario(train_info["type"], train_info["mass"], speed, weather, time_of_day)
    
    if incident:
        description = f"{train_info['type']} train ({train_info['mass']}t) experienced {incident['incident_type']} " \
                      f"while traveling at {speed}km/h in {weather} weather at {location}."
        
        return {
            "train_id": train_id,
            "location": location,
            "speed_kmh": speed,
            "weather": weather,
            "incident_type": incident["incident_type"],
            "action_taken": incident["action_taken"],
            "description": description,
            "severity": incident["severity"]
        }
    return None

def main():
    dataset = []
    target_count = 1000
    
    print(f"Generating {target_count} incident entries...")
    
    while len(dataset) < target_count:
        entry = generate_entry()
        if entry:
            dataset.append(entry)
            
    output_path = "backend/training_data.json"
    with open(output_path, "w") as f:
        json.dump(dataset, f, indent=2)
        
    print(f"Successfully generated {len(dataset)} entries to {output_path}")

if __name__ == "__main__":
    main()
