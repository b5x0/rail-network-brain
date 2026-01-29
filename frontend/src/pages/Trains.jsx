import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import TrackMap from "../components/TrackMap/TrackMap";
import TrainListPanel from "../components/trainsPanelArea/TrainListPanel";
import TrainDetailsPanel from "../components/trainsPanelArea/TrainDetailsPanel";
import TrainSchedulePanel from "../components/trainsPanelArea/TrainSchedulePanel";
import { getSimulationState, startSimulation } from "../services/api";
import { tracks } from "../data/tracksData";

const Trains = () => {
  const [trains, setTrains] = useState([]);

  // Keep last progress to detect movement
  const lastProgressRef = useRef({});

  // Map track IDs
  const trackMapping = {};
  tracks.forEach(track => {
    trackMapping[track.id] = track.id;
  });

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

            console.log("🔁 Polling simulation state...");

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

              return {
                id: train.id,
                type: train.type,
                trackId:
                  trackMapping[train.trackId || train.id.split("-")[0]] ||
                  "red-line",
                progress: curr,
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
