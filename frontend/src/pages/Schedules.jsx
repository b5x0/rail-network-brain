import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import TrackMap from "../components/TrackMap/TrackMap";

import ScheduleListPanel from "../components/schedulePanelArea/ScheduleListPanel";
import SchedulePanel from "../components/schedulePanelArea/SchedulePanel";

import { trainsData } from "../data/TrainsData";

const Trains = () => {
  return (
    <DashboardLayout
      mapContent={<TrackMap data={trainsData} type="train" mode="schedule" />}
      detectorContent={
        <div className="w-full h-full flex flex-col">
          <Link to="/" className="mb-2 text-xs text-gray-800 hover:text-black transition-colors flex items-center gap-1 font-mono">
            <span>←</span> BACK TO LIVE VIEW
          </Link>
          <Routes>
            {/* Default list */}
            <Route index element={<ScheduleListPanel />} />
            {/* Train schedule */}
            <Route path=":trainId/schedule" element={<SchedulePanel />} />
          </Routes>
        </div>
      }
      autoStart={true}
    />
  );
};

export default Trains;
