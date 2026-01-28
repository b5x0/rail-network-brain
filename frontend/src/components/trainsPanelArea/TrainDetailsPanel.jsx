import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../ui/Button";

const TrainDetailsPanel = () => {
  const { trainId } = useParams();

  const trainData = {
    id: trainId,
    type: "Freight_Heavy",
    priority: 1,
    payload_constraints: {
      length_meters: 650,
      mass_tonnes: 1800,
      max_speed_kmh: 100,
      braking_lambda: 65,
      coupling_type: "AAR",
      electrification_type: "Diesel",
      loading_gauge: "GC",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col gap-6"
    >
      <h1 className="text-4xl text-center tracking-widest">TRAIN_INFO</h1>

      <div className="rounded-2xl border-4 border-lime-400 bg-gradient-to-b from-lime-100 to-lime-400 p-4 text-sm">
        <div><b>id :</b> {trainData.id}</div>
        <div><b>type :</b> {trainData.type}</div>
        <div><b>priority :</b> {trainData.priority}</div>

        <div className="mt-2 font-bold">payload_constraints :</div>
        <div className="pl-6 font-mono text-xs">
          length_meters : {trainData.payload_constraints.length_meters}<br />
          mass_tonnes : {trainData.payload_constraints.mass_tonnes}<br />
          max_speed_kmh : {trainData.payload_constraints.max_speed_kmh}<br />
          braking_lambda : {trainData.payload_constraints.braking_lambda}<br />
          coupling_type : {trainData.payload_constraints.coupling_type}<br />
          electrification_type : {trainData.payload_constraints.electrification_type}<br />
          loading_gauge : {trainData.payload_constraints.loading_gauge}
        </div>
      </div>

      <div className="mt-auto flex gap-4 justify-center">
        <Link to="/trains">
          <Button ButtonContent="Back" />
        </Link>

        <Link to={`/trains/${trainId}/schedule`}>
          <Button ButtonContent="Schedules" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TrainDetailsPanel;
