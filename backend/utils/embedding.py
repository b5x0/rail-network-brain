import hashlib

def get_vector(speed_kmh: float = 0.0, location: str = "Unknown", weather: str = "Clear", train_id: str = "Unknown") -> list[float]:
    """
    Simulates a Contrastive Learning Encoder.
    Converts raw telemetry into a deterministic 16-dimensional numerical vector.
    
    This replaces the heavy LLM (SentenceTransformers) for an 'Industrial Grade' pure-math approach.
    """
    
    vector = [0.0] * 16
    
    # Feature 1: Normalized Speed (Indices 0-3)
    # Scale: 0 to 300 km/h -> 0.0 to 1.0
    norm_speed = min(max(speed_kmh / 300.0, 0.0), 1.0)
    vector[0] = norm_speed
    vector[1] = norm_speed ** 2  # Non-linear feature
    vector[2] = 1.0 - norm_speed # Negative correlation
    vector[3] = 0.5 if norm_speed > 0.5 else 0.0 # Threshold feature

    # Feature 2: Location (Indices 4-7)
    # Hash location string to a deterministic float 0-1
    loc_hash = int(hashlib.md5(location.encode()).hexdigest(), 16)
    norm_loc = (loc_hash % 1000) / 1000.0
    vector[4] = norm_loc
    vector[5] = (loc_hash % 100) / 100.0
    vector[6] = 1.0 - norm_loc
    vector[7] = 0.0 # Reserved

    # Feature 3: Weather (Indices 8-11)
    weather_map = {"Clear": 0.0, "Rain": 0.5, "Snow": 0.8, "Hot": 1.0}
    w_val = weather_map.get(weather, 0.1) # Default to 0.1 if unknown
    vector[8] = w_val
    vector[9] = 1.0 - w_val
    vector[10] = w_val ** 2
    vector[11] = 0.5 if w_val > 0.6 else 0.0

    # Feature 4: Train ID / Signature (Indices 12-15)
    train_hash = int(hashlib.md5(train_id.encode()).hexdigest(), 16)
    vector[12] = (train_hash % 500) / 500.0
    vector[13] = (train_hash % 50) / 50.0
    vector[14] = 0.0
    vector[15] = 1.0 

    return vector
