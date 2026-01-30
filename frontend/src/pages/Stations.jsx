import React from "react"
import { Routes, Route, Link } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"
import TrackMap from "../components/TrackMap/TrackMap"

import StationListPanel from "../components/stationPanelArea/StationListPanel"
import StationDetailsPanel from "../components/stationPanelArea/StationDetailsPanel"
import StationPlatformPanel from "../components/stationPanelArea/StationPlatformPanel"

import { stations } from "../data/stationsData"

const Stations = () => {
  return (
    <DashboardLayout
      mapContent={<TrackMap data={stations} type="station" />}
      detectorContent={
        <div className="w-full h-full flex flex-col">
          <Link to="/" className="mb-2 text-xs text-gray-800 hover:text-black transition-colors flex items-center gap-1 font-mono">
            <span>←</span> BACK TO LIVE VIEW
          </Link>
          <Routes>
            {/* Default list */}
            <Route index element={<StationListPanel />} />

            {/* Station details */}
            <Route path=":stationId" element={<StationDetailsPanel />} />

            {/* Station platforms */}
            <Route
              path=":stationId/platforms"
              element={<StationPlatformPanel />}
            />
          </Routes>
        </div>
      }
      autoStart={true}
    />
  )
}

export default Stations
