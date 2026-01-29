import { motion } from "framer-motion"
import { tracks } from "../../data/tracksData"
import Train from "./Train"
import Station from "./Station"
import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

function TrackMap({ data = [], type = "train", mode = "default" }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const location = useLocation()

  // Reset selection when returning to the main list
  useEffect(() => {
    const pathParts = location.pathname.split("/")
    
    // If we're at the main list page, clear selection
    if (
      (type === "train" && pathParts[1] === "schedules" && pathParts.length === 2) ||
      (type === "train" && pathParts[1] === "trains" && pathParts.length === 2) ||
      (type === "station" && pathParts[1] === "stations" && pathParts.length === 2)
    ) {
      setSelectedItem(null)
    }
  }, [location.pathname, type])

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          />
        ))}

        {/* Trains */}
        {type === "train" &&
          data.map((train) => (
            <Train
              key={train.id}
              id={train.id}
              trackId={train.trackId}
              progress={train.progress}
              selectedTrain={selectedItem}
              setSelectedTrain={setSelectedItem}
              mode={mode}
            />
          ))}

        {/* Stations */}
        {type === "station" &&
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
    </div>
  )
}

export default TrackMap
