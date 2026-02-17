import pytest
import sys
import os

# Add backend to path so we can import engine
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from engine import SimulationEngine

@pytest.fixture
def engine():
    return SimulationEngine()

def test_physics_veto_heavy_train_braking(engine):
    """
    Adversarial Test: 'The Hallucinating AI'
    Scenario: User/AI suggests 'Hold' (Emergency Stop) for a heavy freight train 
    moving at max speed. 
    Physics: Stopping distance should exceed safety buffer (300m).
    Expected: VETO (False)
    """
    # Setup: Heavy Freight Train moving fast
    t_id = "T-204" # Freight
    engine.state["trains"][t_id]["current_speed"] = 0.20 # Max speed (abstract)
    # Ensure physical constants match heavy freight
    engine.state["trains"][t_id]["mass_tonnes"] = 2400
    engine.state["trains"][t_id]["max_speed_kmh"] = 100
    
    # Action: Try to stop instantly
    is_safe, reason = engine.is_action_safe(t_id, "Hold")
    
    # Assert: Physics must reject this unsafe command
    print(f"Debug Reason: {reason}")
    assert is_safe is False
    assert "Braking Dist" in reason

def test_physics_safe_hold(engine):
    """
    Scenario: Light Commuter train moving slowly.
    Physics: Stopping distance within 300m.
    Expected: ALLOW (True)
    """
    t_id = "T-408" # Commuter
    engine.state["trains"][t_id]["current_speed"] = 0.01 # Very Slow to ensure safety
    engine.state["trains"][t_id]["mass_tonnes"] = 320
    
    is_safe, reason = engine.is_action_safe(t_id, "Hold")
    
    assert is_safe is True
    assert reason == "Safe"

def test_reroute_safety_check(engine):
    """
    Scenario: AI suggests Reroute.
    Physics: Currently Reroute is always considered 'safe' purely from physics (reversing).
    Expected: ALLOW (True)
    """
    t_id = "T-101"
    is_safe, reason = engine.is_action_safe(t_id, "Reroute")
    assert is_safe is True
