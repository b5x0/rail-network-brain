import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import TrackMap from "../components/TrackMap/TrackMap";
import TrainListPanel from "../components/trainsPanelArea/TrainListPanel";
import TrainDetailsPanel from "../components/trainsPanelArea/TrainDetailsPanel";
import TrainSchedulePanel from "../components/trainsPanelArea/TrainSchedulePanel";
import { trainsData } from "../data/TrainsData";

const Trains = () => {
  return (
    <DashboardLayout
      mapContent={<TrackMap data={trainsData} type="train" />}
      detectorContent={
        <Routes>
          {/* Default list */}
          <Route index element={<TrainListPanel />} />
          {/* Train details */}
          <Route path=":trainId" element={<TrainDetailsPanel />} />
          {/* Train schedule */}
          <Route path=":trainId/schedule" element={<TrainSchedulePanel />} />
        </Routes>
      }
      autoStart = {true}
    />
  );
};

export default Trains;
