import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../ui/Button";

const TrainDetailsPanel = ({ trainData }) => {
  if (!trainData) return <div>Loading train data...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col gap-6"
    >
      <h1 className="text-4xl text-center tracking-widest">TRAIN_INFO</h1>

      <div className="font-mono rounded-2xl border-4 border-lime-400 bg-gradient-to-b from-lime-100 to-lime-400 p-4 text-sm">
        <div><b>id :</b> {trainData.id}</div>
        <div><b>type :</b> {trainData.type}</div>
        <div><b>status :</b> {trainData.status}</div>
        <div><b>location :</b> {trainData.location}</div>
        <div><b>next_location :</b> {trainData.next_location}</div>
        <div><b>current_speed :</b> {trainData.current_speed}</div>
        <div><b>max_speed :</b> {trainData.max_speed}</div>
        <div><b>dwell_timer :</b> {trainData.dwell_timer}</div>
        <div><b>mass_tonnes :</b> {trainData.mass_tonnes}</div>
        <div><b>length_m :</b> {trainData.length_m}</div>
        <div><b>gauge :</b> {trainData.gauge}</div>
      </div>

      <div className="mt-auto flex gap-4 justify-center">
        <Link to="/trains">
          <Button ButtonContent="Back" />
        </Link>

        <Link to={`/trains/${trainData.id}/schedule`}>
          <Button ButtonContent="Schedules" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TrainDetailsPanel;
