import React from "react"
import { Routes, Route } from "react-router-dom"
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
      }
      autoStart={true}
    />
  )
}

export default Stations
