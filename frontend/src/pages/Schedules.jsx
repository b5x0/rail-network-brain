import React from "react";
import { Routes, Route } from "react-router-dom";
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
        <Routes>
          {/* Default list */}
          <Route index element={<ScheduleListPanel />} />
          {/* Train schedule */}
          <Route path=":trainId/schedule" element={<SchedulePanel />} />
        </Routes>
      }
      autoStart = {true}
    />
  );
};

export default Trains;
