import time
import threading
import copy

TICK_RATE = 1.0  
SPEED_MULTIPLIER = 1.5 

class SimulationEngine:
    def __init__(self):
        self.running = False
        self.paused = False 
        self.lock = threading.Lock()
        self.state = { "time": 0, "trains": {}, "alerts": [], "veto_count": 0, "total_energy_saved_joules": 0 }
        # Environment Oracle: Stores the absolute truth of the simulation world
        self.routes = {} 
        self.immunity_log = {} 
        self.load_world()
        
    def generate_schedule(self, train_id):
        """Generates a dynamic schedule based on the train's route and current state."""
        train = self.state["trains"][train_id]
        route = self.routes[train_id]
        current_idx = train["route_index"]
        
        schedule = []
        # Estimate time: 1 tick = 1 minute for UI purposes
        # Start from current time
        arrival_offset = 0
        
        # Determine remaining route (circular buffer logic simplified here)
        # We just show the next few stops
        stops_to_show = route[current_idx:] + route[:current_idx]
        stops_to_show = stops_to_show[:5] # Show next 5 stops
        
        for stop in stops_to_show:
            # Simple heuristic: Distance / Speed
            # Distances are abstract (1.0 units). Speed is ~0.1-0.5 units/tick.
            # Time to traverse 1 segment ~ 1.0 / speed.
            speed = max(train["max_speed"], 0.1) # Avoid div by zero
            ticks_needed = 1.0 / speed * 10 # Scale factor
            
            arrival_offset += ticks_needed
            arrival_time_ticks = self.state["time"] + arrival_offset
            
            # Format as HH:MM
            sim_start_hour = 8
            minutes_total = int(arrival_time_ticks)
            hours = (sim_start_hour + minutes_total // 60) % 24
            mins = minutes_total % 60
            time_str = f"{hours:02d}:{mins:02d}"
            
            # Departure is arrival + dwell (approx 2 mins)
            dep_minutes = minutes_total + 2
            dep_hours = (sim_start_hour + dep_minutes // 60) % 24
            dep_mins = dep_minutes % 60
            dep_str = f"{dep_hours:02d}:{dep_mins:02d}"
            
            status = "On Time"
            if train["current_speed"] < train["max_speed"] * 0.5:
                status = "Delayed"

            schedule.append({
                "station_id": stop,
                "arrival_time": time_str,
                "departure_time": dep_str,
                "status": status # Keep status for potential future use or other components
            })
            
        train["schedule"] = schedule

    def load_world(self):
        # Define all train routes as sequences of station and waypoint names
        # Routes are circular paths that trains follow in order
        route_red = ["Red_Start", "S-1", "S-2", "Red_WP1", "Red_WP2", "Ariana_Central", "Sfax_Central", "Ariana_Central", "Red_WP2", "Red_WP1", "S-2", "S-1", "Red_Start"]
        route_yellow = ["Sousse_Central", "S-3", "Orange_WP1", "Ariana_Central", "Sfax_Central", "Ariana_Central", "Orange_WP1", "S-3", "Sousse_Central"]
        route_green = ["Green_Start", "S-5", "S-6", "S-7", "Ariana_Central", "S-7", "S-6", "S-5", "Green_Start"]
        route_blue = ["Tunis_Central", "Blue_WP1", "Blue_WP2", "S-4", "Blue_WP3", "Ariana_Central", "Blue_WP3", "S-4", "Blue_WP2", "Blue_WP1", "Tunis_Central"]
        route_cyan = ["Cyan_Start", "Sfax_Central", "Cyan_Start"]

        self.routes = { "T-101": route_red, "T-204": route_yellow, "T-305": route_green, "T-408": route_blue, "T-505": route_cyan }

        # Initialize each train with its starting position, route, and physical characteristics
        # T-101 (Red Express): Light, Aerodynamic, Standard Gauge - High-speed passenger train
        self.state["trains"]["T-101"] = {
            "id": "T-101", "type": "Passenger_HighSpeed", 
            "location": "Red_Start", "next_location": "S-1", "progress": 0.0, 
            "status": "Boarding", "current_speed": 0.0, "max_speed": 0.50, 
            "dwell_timer": 2, "start_tick": 0, "route_index": 0,
            # Physical characteristics that affect braking distance and speed capabilities
            "mass_tonnes": 480, "length_m": 200, "gauge": "Standard (1435mm)",
            "max_speed_kmh": 300
        }
        
        # T-408 (Blue Commuter): Medium weight, Standard Gauge - Rapid commuter service
        self.state["trains"]["T-408"] = {
            "id": "T-408", "type": "Commuter_Rapid", 
            "location": "Tunis_Central", "next_location": "Blue_WP1", "progress": 0.0, 
            "status": "Scheduled", "current_speed": 0.0, "max_speed": 0.35, 
            "dwell_timer": 0, "start_tick": 5, "route_index": 0,
            # Physical characteristics that affect braking distance and speed capabilities
            "mass_tonnes": 320, "length_m": 150, "gauge": "Standard (1435mm)",
            "max_speed_kmh": 160
        }

        # T-305 (Green Regional): Diesel-powered, Standard Gauge - Regional/commuter service
        self.state["trains"]["T-305"] = {
            "id": "T-305", "type": "Regional_Standard", 
            "location": "Green_Start", "next_location": "S-5", "progress": 0.0, 
            "status": "Scheduled", "current_speed": 0.0, "max_speed": 0.30, 
            "dwell_timer": 0, "start_tick": 12, "route_index": 0,
            # Physical characteristics that affect braking distance and speed capabilities
            "mass_tonnes": 110, "length_m": 80, "gauge": "Standard (1435mm)",
            "max_speed_kmh": 140
        }
        
        # T-204 (Yellow Freight): Heavy cargo train with significantly longer stopping distance
        self.state["trains"]["T-204"] = {
            "id": "T-204", "type": "Freight_Heavy", 
            "location": "Sousse_Central", "next_location": "S-3", "progress": 0.0, 
            "status": "Scheduled", "current_speed": 0.0, "max_speed": 0.20, 
            "dwell_timer": 0, "start_tick": 20, "route_index": 0,
            # Physical characteristics that affect braking distance and speed capabilities
            "mass_tonnes": 2400, "length_m": 600, "gauge": "Standard (1435mm)",
            "max_speed_kmh": 100
        }

        # T-505 (Cyan Metro): Light metro train on narrow metric gauge track
        self.state["trains"]["T-505"] = {
            "id": "T-505", "type": "Metro_Light", 
            "location": "Cyan_Start", "next_location": "Sfax_Central", "progress": 0.0, 
            "status": "Scheduled", "current_speed": 0.0, "max_speed": 0.40, 
            "dwell_timer": 0, "start_tick": 2, "route_index": 0,
            # Physical characteristics that affect braking distance and speed capabilities
            "mass_tonnes": 60, "length_m": 40, "gauge": "Metric (1000mm)",
            "max_speed_kmh": 80
        }
        
        # Initialize schedules
        for t_id in self.state["trains"]:
            self.generate_schedule(t_id)

    def start(self):
        if not self.running: self.running = True; threading.Thread(target=self.loop, daemon=True).start()

    def stop(self):
        self.running = False

    def loop(self):
        """Main simulation loop that runs continuously while simulation is active.
        Executes collision detection and physics updates each tick, respecting pause state."""
        while self.running:
            with self.lock:
                self.clean_immunity()
                if not self.paused: self.detect_conflicts()
                if not self.paused: self.update_physics()
            time.sleep(TICK_RATE)

    def update_physics(self):
        """Update train positions and velocities each simulation tick.
        Handles acceleration, position updates, station arrivals, and dwell times."""
        self.state["time"] += 1
        current_time = self.state["time"]
        
        for t_id, train in self.state["trains"].items():
            # Skip trains that haven't started their journey yet
            if current_time < train.get("start_tick", 0): 
                train["status"] = f"Departs T-{train['start_tick']}"
                continue
            
            # Train is stopped at a station/waypoint; count down dwell time before continuing
            if train["dwell_timer"] > 0:
                train["dwell_timer"] -= 1
                if "Hold" in train.get("status", ""): train["status"] = f"HOLDING ({train['dwell_timer']}s)"
                else: train["status"] = "Station Stop"
                continue

            # Train is moving between stations; accelerate/decelerate and advance position
            train["status"] = "En Route"
            if train["current_speed"] < train["max_speed"]: 
                train["current_speed"] += 0.05
            elif train["current_speed"] > train["max_speed"]:
                train["current_speed"] = max(train["max_speed"], train["current_speed"] - 0.05)
            train["progress"] += train["current_speed"]
            
            # Check if train has reached next station
            if train["progress"] >= 1.0:
                # Advance train to next station and prepare for next segment
                train["location"] = train["next_location"]
                train["progress"] = 0.0
                train["current_speed"] = 0.0
                train["route_index"] += 1
                
                # Load next destination and set dwell time based on station type
                route = self.routes[t_id]
                if train["route_index"] + 1 < len(route):
                    train["next_location"] = route[train["route_index"] + 1]
                    # Waypoints: brief or no stop; Central stations: longer dwell for passenger exchange
                    if "WP" in train["location"]: train["dwell_timer"] = 0
                    elif "Central" in train["location"]: train["dwell_timer"] = 4
                    else: train["dwell_timer"] = 2  
                else:
                    # Route complete; reset to beginning for circular routes
                    train["route_index"] = 0
                    train["location"] = route[0]
                    train["next_location"] = route[1]
                    train["dwell_timer"] = 10 
            
            # Update schedule every 10 ticks to reflect delays/progress
            if self.state["time"] % 10 == 0:
                self.generate_schedule(t_id) 

    def detect_conflicts(self):
        """Scan all trains to find potential collisions at stations.
        Identifies stations where multiple trains are converging and triggers alerts."""
        # Step 1: Build map of trains heading to each location
        # Only consider major stations (not waypoints) to reduce false alarms
        conflict_zones = {} 
        
        for t_id, t in self.state["trains"].items():
            # Determine which station the train will occupy next
            target = t["next_location"]
            # If train is currently dwelling at a station, it occupies that station
            if t["dwell_timer"] > 0: target = t["location"]
            
            # Skip waypoints since trains can safely pass through them on parallel tracks
            if "WP" in target: continue 
            
            if target not in conflict_zones: conflict_zones[target] = []
            conflict_zones[target].append(t_id)
            
        # Step 2: Check for conflicts and trigger alerts for convergences
        for loc, trains in conflict_zones.items():
            if len(trains) > 1:
                t1, t2 = trains[0], trains[1]
                pair_key = tuple(sorted([t1, t2]))
                
                # Only alert if we haven't recently resolved this pair of trains
                if pair_key not in self.immunity_log:
                    if not self.has_active_alerts():
                        # Pause simulation to let user resolve the conflict
                        self.paused = True
                        self.trigger_alert(t1, t2, loc)
                        return  # Only one alert at a time to avoid overwhelming the user

    def trigger_alert(self, t1, t2, loc):
        self.state["alerts"].append({
            "id": f"A-{self.state['time']}", "location": loc, "trains": [t1, t2], 
            "timestamp": self.state["time"], "resolved": False
        })

    def has_active_alerts(self): return any(not a["resolved"] for a in self.state["alerts"])

    def calculate_stopping_distance(self, train):
        """Calculates the stopping distance based on physics."""
        # Map abstract speed (0.0-0.5) to km/h
        # If train['max_speed'] (abstract) corresponds to train['max_speed_kmh']
        if train["max_speed"] <= 0: return 0
        
        ratio = train["current_speed"] / train["max_speed"]
        speed_kmh = ratio * train.get("max_speed_kmh", 100) # Default to 100 if missing
        
        # Formula: (0.5 * mass * (speed_m_s)^2) / Force
        # Force = 15 kN (simulated braking force)
        speed_ms = speed_kmh / 3.6
        energy = 0.5 * train["mass_tonnes"] * (speed_ms ** 2)
        # Using 15 as divisor as per requirement (assuming 15 represents the braking constant in this formula context)
        # Realistically Force would be much higher for a train (e.g. hundreds of kN), but we follow the prompt's formula.
        distance = energy / 15 
        return distance

    def calculate_kinetic_energy(self, train):
        """Calculates current Kinetic Energy in Joules.
        Formula: 0.5 * mass(kg) * velocity(m/s)^2"""
        ratio = 0
        if train["max_speed"] > 0:
            ratio = train["current_speed"] / train["max_speed"]
        
        speed_kmh = ratio * train.get("max_speed_kmh", 100)
        speed_ms = speed_kmh / 3.6
        mass_kg = train["mass_tonnes"] * 1000
        
        return 0.5 * mass_kg * (speed_ms ** 2)

    def is_action_safe(self, train_id, action):
        """Checks if an action is physically safe for the given train.
        Returns (is_safe: bool, reason: str)"""
        train = self.state["trains"][train_id]
        
        if action == "Hold":
            stopping_dist = self.calculate_stopping_distance(train)
            safety_buffer = 300 # meters
            if stopping_dist > safety_buffer:
                return False, f"Braking Dist {stopping_dist:.0f}m > 300m"
        
        return True, "Safe"

    def apply_resolution(self, train_id, action):
        """Apply the user's chosen resolution action to prevent the collision.
        Modifies train behavior and adds immunity period to prevent repeated alerts."""
        train = self.state["trains"][train_id]
        
        # Deterministic Safety Agent (The Watcher)
        if action == "Hold":
            is_safe, reason = self.is_action_safe(train_id, action)
            if not is_safe:
                # VETO: Train is too fast/heavy to stop safely
                print(f"[THE WATCHER] 🛡️ PHYSICS VETO: Train {train_id} cannot stop. {reason}. Overriding to Reroute.")
                self.state["veto_count"] += 1
                action = "Reroute" # Override action

        # Energy Calculation (Real Physics)
        # We assume avoiding a collision saves the energy of the moving train (simplified)
        # OR we calculate energy dissipated by braking.
        energy_saved = 0
        if action in ["Hold", "Slow Down"]:
            energy_saved = self.calculate_kinetic_energy(train)
            self.state["total_energy_saved_joules"] += energy_saved
            # print(f"⚡ Energy Saved: {energy_saved/1_000_000:.2f} MJ")

        if action == "Hold":
            # Stop train at signal for 10 seconds to clear the conflicted station
            train["dwell_timer"] = 10
            train["status"] = "HOLDING (Signal)"
        elif action == "Slow Down":
            # Reduce train's max speed to let other train pass through first
            train["max_speed"] = 0.1
            train["status"] = "Restricted Speed"
        elif action == "Reroute":
            # Send train backward one segment to use alternate route
            if train["route_index"] > 0:
                train["route_index"] -= 1
                route = self.routes[train_id]
                train["next_location"] = route[train["route_index"]]
                train["progress"] = 0.0
                train["status"] = "REVERSING"

        # Mark this train pair with immunity to prevent repeated alerts for 30 ticks
        alert = self.state["alerts"][-1]
        pair_key = tuple(sorted(alert["trains"]))
        self.immunity_log[pair_key] = 30
        alert["resolved"] = True
        alert["solution"] = {"action": action}
        self.paused = False

    def clean_immunity(self):
        """Decrement immunity timers each tick and remove expired entries.
        Expired immunities allow alerts to be re-triggered for the same train pair."""
        expired = []
        for pair, timer in self.immunity_log.items():
            if timer > 0: self.immunity_log[pair] -= 1
            else: expired.append(pair)
        # Clean up expired immunity entries
        for p in expired: del self.immunity_log[p]

    def get_state(self):
        with self.lock: return copy.deepcopy(self.state)

simulation = SimulationEngine()