import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../ui/Button";

const TrainSchedulePanel = ({ trainData }) => {
  if (!trainData) return <div>Loading train schedule...</div>;

  const stops = trainData.schedule || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl text-center mb-4">Schedules</h2>

      <div className="font-mono bg-gradient-to-b from-[#e9d9b0] to-[#d4b46c] border-4 border-[#f1c40f] rounded-3xl p-4 text-sm">
        <div>train_id : {trainData.id}</div>

        {stops.length === 0 && <div className="pl-6 mt-2">No schedule available</div>}

        {stops.map((stop, i) => (
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

        <Link to={`/trains/${trainData.id}`}>
          <Button ButtonContent="Train_Info" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TrainSchedulePanel;
