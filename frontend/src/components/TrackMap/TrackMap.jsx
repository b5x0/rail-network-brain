import { motion } from "framer-motion"
import { tracks } from "../../data/tracksData"
import Train from "./Train"
import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

function TrackMap({ trains = [] }) {
  const [selectedTrain, setSelectedTrain] = useState(null)
  const location = useLocation()

  // Reset selection when we are in the main train list (no trainId in URL)
  useEffect(() => {
    const pathParts = location.pathname.split("/")
    if (pathParts.length === 2 && pathParts[1] === "trains") {
      setSelectedTrain(null)
    }
  }, [location.pathname])

  return (
    <div className="w-full h-full">
      <svg viewBox="0 0 1000 1000" className="w-full h-full rounded-full">
        {/* Tracks */}
        {tracks.map((track, index) => (
          <motion.path
            key={track.id}
            id={track.id}
            d={track.path}
            fill="none"
            stroke={track.color}
            strokeWidth={track.width}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: index * 0.3 }}
          />
        ))}

        {/* Trains */}
        {trains.map((train) => (
          <Train
            key={train.id}
            id={train.id}
            trackId={train.trackId}
            progress={train.progress}
            selectedTrain={selectedTrain}
            setSelectedTrain={setSelectedTrain}
          />
        ))}
      </svg>
    </div>
  )
}

export default TrackMap
