import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../ui/Button";

const TrainSchedulePanel = () => {
  const { trainId } = useParams();

  const scheduleData = {
    route_id: "Route-North-South",
    train_id: trainId,
    stops: [
      { station_id: "Tunis_Central", platform_id: "Platform-Tunis-01", arrival_time: "08:00", departure_time: "08:15" },
      { station_id: "Sousse_Central", platform_id: "Platform-Sousse-03", arrival_time: "09:30", departure_time: "09:40" },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl text-center mb-4">Schedules</h2>

      <div className="bg-gradient-to-b from-[#e9d9b0] to-[#d4b46c] border-4 border-[#f1c40f] rounded-3xl p-4 text-sm">
        <div>train_id : {scheduleData.train_id}</div>

        {scheduleData.stops.map((stop, i) => (
          <div key={i} className="pl-6 mt-3">
            <div>{stop.station_id}</div>
            <div>{stop.arrival_time} → {stop.departure_time}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <Link to="/trains">
          <Button ButtonContent="Back" />
        </Link>

        <Link to={`/trains/${trainId}`}>
          <Button ButtonContent="Train_Info" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TrainSchedulePanel;
