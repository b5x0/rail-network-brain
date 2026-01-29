import React from "react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import Button from "../ui/Button"

const StationDetailsPanel = () => {
  const { stationId } = useParams()

  const stationData = {
    id: stationId || "Tunis_Central",
    name: "Tunis Central Station",
    location: {
      lat: 36.8065,
      lon: 10.1815,
    },
    platform_ids: ["Platform-Tunis-01", "Platform-Tunis-02"],
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col gap-6"
    >
      {/* Header */}
      <h1 className="text-4xl text-center tracking-widest">
        STATION_INFO
      </h1>

      {/* Info Card */}
      <div className="font-mono rounded-2xl border-4 border-blue-500 bg-gradient-to-b from-blue-100 to-blue-400 p-4 text-sm">
        <div>
          <b>id :</b> {stationData.id}
        </div>

        <div>
          <b>name :</b> {stationData.name}
        </div>

        <div className="mt-2 font-bold">location :</div>
        <div className="pl-6 font-mono text-xs">
          lat : {stationData.location.lat}
          <br />
          lon : {stationData.location.lon}
        </div>

        <div className="mt-2 font-bold">platform_ids :</div>
        <div className="pl-6 font-mono text-xs">
          {stationData.platform_ids.map((platform) => (
            <div key={platform}>- {platform}</div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-4 justify-center">
        <Link to="/stations">
          <Button ButtonContent="Back" />
        </Link>

        <Link to={`/stations/${stationId}/platforms`}>
          <Button ButtonContent="Platforms" />
        </Link>
      </div>
    </motion.div>
  )
}

export default StationDetailsPanel
