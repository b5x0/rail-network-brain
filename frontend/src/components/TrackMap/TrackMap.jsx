import { motion } from "framer-motion";
import { tracks } from "../../data/tracksData";
import Train from "./Train";
import Station from "./Station";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function TrackMap({ data = [], type = "train", mode = "default", conflictMarker }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (
      (type === "train" && pathParts[1] === "schedules" && pathParts.length === 2) ||
      (type === "train" && pathParts[1] === "trains" && pathParts.length === 2) ||
      (type === "station" && pathParts[1] === "stations" && pathParts.length === 2)
    ) {
      setSelectedItem(null);
    }
  }, [location.pathname, type]);

  // ✅ DOUBLE SAFETY: Ensure conflictMarker is real numbers
  const hasValidMarker = conflictMarker && 
                         typeof conflictMarker.x === 'number' && 
                         typeof conflictMarker.y === 'number' &&
                         Number.isFinite(conflictMarker.x) && 
                         Number.isFinite(conflictMarker.y);

  return (
    <div className="w-full h-full">
      <svg viewBox="0 0 1000 1000" className="w-full h-full">
        {/* Tracks */}
        {tracks.map((track, index) => (
          <motion.path
            key={track.id}
            id={track.id}
            d={track.path}
            fill="none"
            stroke={track.color}
            strokeWidth={track.width}
            strokeDasharray={track.dashArray || "0"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          />
        ))}

        {/* 🚨 CONFLICT PULSE (Crash-Proof) */}
        {hasValidMarker && (
            <circle
                cx={conflictMarker.x}
                cy={conflictMarker.y}
                r="15"
                fill="rgba(255, 0, 0, 0.8)"
                stroke="#fff"
                strokeWidth="2"
                className="animate-ping"
                style={{
                    animation: "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite"
                }}
            />
        )}

        {/* Real Trains (With Safety Filtering) */}
        {type === "train" &&
          Array.isArray(data) &&
          data.map((train) => {
             // 🛡️ Sanity Check: If train progress is broken, skip rendering it
             if (typeof train.progress !== 'number' || isNaN(train.progress)) {
                 // console.error("⛔ Skipping broken train render:", train.id, train.progress);
                 return null;
             }
             return (
                <Train
                  key={train.id}
                  id={train.id}
                  trackId={train.trackId}
                  progress={train.progress}
                  selectedTrain={selectedItem}
                  setSelectedTrain={setSelectedItem}
                  mode={mode}
                />
             );
          })}

        {/* Stations */}
        {type === "station" &&
          Array.isArray(data) &&
          data.map((station) => (
            <Station
              key={station.id}
              id={station.id}
              name={station.name}
              trackId={station.trackId}
              progress={station.progress}
              selectedStation={selectedItem}
              setSelectedStation={setSelectedItem}
            />
          ))}
      </svg>
      
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        circle { transform-box: fill-box; transform-origin: center; }
      `}</style>
    </div>
  );
}

export default TrackMap;