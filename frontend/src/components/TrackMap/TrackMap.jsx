import { motion } from "framer-motion"
import { tracks } from "../../data/tracksData"


import Train from "./Train"
import Station from "./Station"
import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

function TrackMap({ data = [], type = "train" }) {
  const [selectedItem, setSelectedItem] = useState(null)
  const location = useLocation()

  // Reset selection when returning to list
  useEffect(() => {
    const pathParts = location.pathname.split("/")
    if (
      (type === "train" && pathParts[1] === "trains" && pathParts.length === 2) ||
      (type === "station" && pathParts[1] === "stations" && pathParts.length === 2)
    ) {
      setSelectedItem(null)
    }
  }, [location.pathname, type])

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

        {/* Entities */}
        {type === "train" &&
          data.map((train) => (
            <Train
              key={train.id}
              {...train}
              selectedTrain={selectedItem}
              setSelectedTrain={setSelectedItem}
            />
          ))}

        {type === "station" &&
          data.map((station , index) => (
            <Station
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
