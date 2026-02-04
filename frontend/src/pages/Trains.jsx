import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, useParams, Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import TrackMap from "../components/TrackMap/TrackMap";
import TrainListPanel from "../components/trainsPanelArea/TrainListPanel";
import TrainDetailsPanel from "../components/trainsPanelArea/TrainDetailsPanel";
import TrainSchedulePanel from "../components/trainsPanelArea/TrainSchedulePanel";
import CollisionAlert from "../components/CollisionAlert";
import StatsPanel from "../components/StatsPanel";
import { getSimulationState, startSimulation } from "../services/api";

// 📍 COORDINATES
const STATION_COORDINATES = {
  "Red_Start": { x: 354, y: 87 }, "S-1": { x: 350, y: 179 }, "S-2": { x: 348, y: 339 },
  "Red_WP1": { x: 372, y: 471 }, "Red_WP2": { x: 662, y: 471 },
  "Ariana_Central": { x: 684, y: 559 }, "Sfax_Central": { x: 686, y: 781 },
  "Sousse_Central": { x: 38, y: 491 }, "S-3": { x: 244, y: 489 }, "Orange_WP1": { x: 640, y: 493 },
  "Tunis_Central": { x: 442, y: 201 }, "S-4": { x: 486, y: 443 },
  "Blue_WP1": { x: 376, y: 265 }, "Blue_WP2": { x: 376, y: 427 }, "Blue_WP3": { x: 680, y: 449 },
  "Green_Start": { x: 732, y: 69 }, "S-5": { x: 732, y: 179 }, "S-6": { x: 734, y: 315 }, "S-7": { x: 732, y: 427 },
  "Cyan_Start": { x: 734, y: 959 }
};

const Trains = () => {
  const [trains, setTrains] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [conflictMarker, setConflictMarker] = useState(null);

  const lastProgressRef = useRef({});

  // TRACK LINES
  const trainToTrackMapping = {
    "T-101": "red-line", "T-408": "dark-blue-line",
    "T-305": "green-line", "T-204": "orange-line", "T-505": "teal-line"
  };

  const getStationPosition = (stationName, lineId) => {
    // Red Line
    if (lineId === "red-line") {
      const map = { "Red_Start": 0.0, "S-1": 0.15, "S-2": 0.32, "Red_WP1": 0.45, "Red_WP2": 0.65, "Ariana_Central": 0.78, "Sfax_Central": 1.0 };
      if (map[stationName] !== undefined) return { track: "red-line", progress: map[stationName] };
    }
    // Teal Line
    if (lineId === "teal-line") {
      const map = { "Cyan_Start": 0.0, "Sfax_Central": 1.0 };
      if (map[stationName] !== undefined) return { track: "teal-line", progress: map[stationName] };
    }
    // Green Line
    if (lineId === "green-line") {
      const map = { "Green_Start": 0.0, "S-5": 0.25, "S-6": 0.55, "S-7": 0.85, "Ariana_Central": 1.0 };
      if (map[stationName] !== undefined) return { track: "green-line", progress: map[stationName] };
    }
    // Orange Line
    if (lineId === "orange-line") {
      const map = { "Sousse_Central": 0.0, "S-3": 0.25, "Orange_WP1": 0.5, "Ariana_Central": 0.8, "Sfax_Central": 1.0 };
      if (map[stationName] !== undefined) return { track: "orange-line", progress: map[stationName] };
    }
    // Blue Line
    if (lineId === "dark-blue-line") {
      const map = { "Tunis_Central": 0.0, "Blue_WP1": 0.25, "Blue_WP2": 0.45, "S-4": 0.6, "Blue_WP3": 0.76, "Ariana_Central": 1.0 };
      if (map[stationName] !== undefined) return { track: "dark-blue-line", progress: map[stationName] };
    }
    return null;
  };

  useEffect(() => {
    let interval;
    const initSimulation = async () => {
      try {
        await startSimulation();
        interval = setInterval(async () => {
          try {
            const state = await getSimulationState();
            if (!state?.trains) return;

            const rawAlert = state.alerts?.find(a => !a.resolved);

            if (rawAlert) {
              setActiveAlert(rawAlert);

              const coords = STATION_COORDINATES[rawAlert.location];
              if (coords) {
                setConflictMarker(coords);
              } else {
                console.warn("Alert at unknown location:", rawAlert.location);
                setConflictMarker(null);
              }
            } else {
              setActiveAlert(null);
              setConflictMarker(null);
            }

            const trainsArray = Object.values(state.trains).map(train => {
              const trackId = trainToTrackMapping[train.id] || "red-line";
              const currentStation = getStationPosition(train.location, trackId);
              const nextStation = getStationPosition(train.next_location, trackId);

              let trackProgress = 0;

              if (currentStation && nextStation && currentStation.track === nextStation.track) {
                const segmentProgress = train.progress || 0;
                trackProgress = currentStation.progress +
                  (nextStation.progress - currentStation.progress) * segmentProgress;
              } else if (currentStation) {
                trackProgress = currentStation.progress;
              }

              lastProgressRef.current[train.id] = trackProgress;
              return { ...train, trackId: trackId, progress: Math.max(0, Math.min(1, trackProgress)) };
            });

            setTrains(trainsArray);
          } catch (err) { console.error(err); }
        }, 500);
      } catch (err) { console.error(err); }
    };
    initSimulation();
    return () => clearInterval(interval);
  }, []);

  const handleAlertResolve = () => {
    setActiveAlert(null);
    setConflictMarker(null);
  };

  return (
    <DashboardLayout
      mapContent={
        <>
          <TrackMap data={trains} type="train" conflictMarker={conflictMarker} />
          <StatsPanel />
        </>
      }
      detectorContent={
        <div className="w-full h-full relative flex flex-col">
          <Link to="/" className="mb-2 text-xs text-gray-500 hover:text-black transition-colors flex items-center gap-1 font-mono">
            <span>←</span> BACK TO LIVE VIEW
          </Link>
          {activeAlert && (
            <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, width: '380px', maxWidth: '90vw' }}>
              <CollisionAlert alert={activeAlert} onResolve={handleAlertResolve} />
            </div>
          )}
          <div className="h-full">
            <Routes>
              <Route index element={<TrainListPanel />} />
              <Route path=":trainId" element={<TrainDetailsWrapper trains={trains} />} />
              <Route path=":trainId/schedule" element={<TrainScheduleWrapper trains={trains} />} />
            </Routes>
          </div>
        </div>
      }
      autoStart={true}
    />
  );
};

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