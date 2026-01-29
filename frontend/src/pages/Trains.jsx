import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import TrackMap from "../components/TrackMap/TrackMap";
import TrainListPanel from "../components/trainsPanelArea/TrainListPanel";
import TrainDetailsPanel from "../components/trainsPanelArea/TrainDetailsPanel";
import TrainSchedulePanel from "../components/trainsPanelArea/TrainSchedulePanel";
import CollisionAlert from "../components/CollisionAlert";
import { getSimulationState, startSimulation } from "../services/api";
import { tracks } from "../data/tracksData";

const Trains = () => {
  const [trains, setTrains] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);

  // Keep last progress to detect movement
  const lastProgressRef = useRef({});

  // Map train IDs to track IDs based on backend routes
  const trainToTrackMapping = {
    "T-101": "red-line",     // Red Express
    "T-408": "dark-blue-line", // Blue Commuter  
    "T-305": "green-line",   // Green Regional
    "T-204": "orange-line",  // Yellow Freight
    "T-505": "teal-line"     // Cyan Metro
  };

  // Map stations to track progress positions
  const stationProgressMapping = {
    // Red line stations
    "Red_Start": { track: "red-line", progress: 0.0 },
    "S-1": { track: "red-line", progress: 0.15 },
    "S-2": { track: "red-line", progress: 0.32 },
    "Red_WP1": { track: "red-line", progress: 0.45 },
    "Red_WP2": { track: "red-line", progress: 0.65 },
    "Ariana_Central": { track: "red-line", progress: 0.78 },
    "Sfax_Central": { track: "red-line", progress: 1.0 },
    
    // Orange line stations
    "Sousse_Central": { track: "orange-line", progress: 0.0 },
    "S-3": { track: "orange-line", progress: 0.25 },
    "Orange_WP1": { track: "orange-line", progress: 0.5 },
    
    // Blue line stations
    "Tunis_Central": { track: "dark-blue-line", progress: 0.0 },
    "Blue_WP1": { track: "dark-blue-line", progress: 0.25 },
    "Blue_WP2": { track: "dark-blue-line", progress: 0.45 },
    "S-4": { track: "dark-blue-line", progress: 0.6 },
    "Blue_WP3": { track: "dark-blue-line", progress: 0.76 },
    
    // Green line stations
    "Green_Start": { track: "green-line", progress: 0.0 },
    "S-5": { track: "green-line", progress: 0.25 },
    "S-6": { track: "green-line", progress: 0.55 },
    "S-7": { track: "green-line", progress: 1.0 },
    
    // Cyan line stations
    "Cyan_Start": { track: "teal-line", progress: 0.0 }
  };

  useEffect(() => {
    let interval;

    const initSimulation = async () => {
      try {
        console.log("🚀 Starting simulation...");
        await startSimulation();

        interval = setInterval(async () => {
          try {
            const state = await getSimulationState();

            if (!state?.trains) {
              console.warn("⚠️ No trains in simulation state");
              return;
            }

            // Check for active alerts
            const alert = state.alerts?.find(a => !a.resolved);
            setActiveAlert(alert);

            console.log("🔁 Polling simulation state...");
            console.log("Full state:", state);
            console.log("Active alerts:", state.alerts?.filter(a => !a.resolved));

            const trainsArray = Object.values(state.trains).map(train => {
              const prev = lastProgressRef.current[train.id];
              const curr = train.progress ?? 0;

              // 🔍 Progress debug
              if (prev === undefined) {
                console.log(
                  `🚆 [${train.id}] initial progress →`,
                  curr
                );
              } else if (prev !== curr) {
                console.log(
                  `📈 [${train.id}] progress changed:`,
                  prev,
                  "→",
                  curr
                );
              } else {
                console.log(
                  `🧊 [${train.id}] progress frozen at`,
                  curr
                );
              }

              // Save current progress
              lastProgressRef.current[train.id] = curr;

              // Calculate track position based on current location and progress
              const currentStation = stationProgressMapping[train.location];
              const nextStation = stationProgressMapping[train.next_location];
              
              let trackId = trainToTrackMapping[train.id] || "red-line";
              let trackProgress = 0;
              
              if (currentStation && nextStation && currentStation.track === nextStation.track) {
                // Interpolate between current and next station
                const segmentProgress = train.progress || 0;
                trackProgress = currentStation.progress + 
                  (nextStation.progress - currentStation.progress) * segmentProgress;
              } else if (currentStation) {
                // Use current station position
                trackProgress = currentStation.progress;
                trackId = currentStation.track;
              }
              
              return {
                id: train.id,
                type: train.type,
                trackId: trackId,
                progress: Math.max(0, Math.min(1, trackProgress)),
                location: train.location,
                next_location: train.next_location,
                status: train.status,
                current_speed: train.current_speed,
                max_speed: train.max_speed,
                dwell_timer: train.dwell_timer,
                mass_tonnes: train.mass_tonnes,
                length_m: train.length_m,
                gauge: train.gauge,
                schedule: train.schedule || [],
              };
            });

            setTrains(trainsArray);
          } catch (err) {
            console.error("❌ Error fetching simulation state:", err);
          }
        }, 500);
      } catch (err) {
        console.error("❌ Error starting simulation:", err);
      }
    };

    initSimulation();

    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("🛑 Simulation polling stopped");
      }
    };
  }, []);

  return (
    <DashboardLayout
      mapContent={<TrackMap data={trains} type="train" />}
      detectorContent={
        <div className="w-full h-full flex flex-col">
          {activeAlert && <CollisionAlert alert={activeAlert} />}
          <div className="flex-1">
            <Routes>
              <Route index element={<TrainListPanel />} />
              <Route
                path=":trainId"
                element={<TrainDetailsWrapper trains={trains} />}
              />
              <Route
                path=":trainId/schedule"
                element={<TrainScheduleWrapper trains={trains} />}
              />
            </Routes>
          </div>
        </div>
      }
      autoStart={true}
    />
  );
};

// ---- Wrappers ----

const TrainDetailsWrapper = ({ trains }) => {
  const { trainId } = useParams();
  const trainData = trains.find(t => t.id === trainId);
  return <TrainDetailsPanel trainData={trainData} />;
};

const TrainScheduleWrapper = ({ trains }) => {
  const { trainId } = useParams();
  const trainData = trains.find(t => t.id === trainId);
  return <TrainSchedulePanel trainData={trainData} />;
};

export default Trains;
