import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../ui/Button";

const StationPlatformPanel = () => {
  const { platformId, stationId } = useParams();

  const platformData = {
    id: platformId,
    station_group_id: stationId,
    payload_constraints: {
      usable_length_meters: 150.0,
      is_electrified: true,
      passenger_density_limit: 500,
      accessibility_level: "High",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl text-center mb-4">Platforms</h2>

      <div className="font-mono bg-gradient-to-b from-[#e9d9b0] to-[#d4b46c] border-4 border-[#f1c40f] rounded-3xl p-4 text-sm">
        <div>platform_id : {platformData.id}</div>
        <div>station_group_id : {platformData.station_group_id}</div>

        <div className="pl-6 mt-4">
          <div>usable_length_meters : {platformData.payload_constraints.usable_length_meters}</div>
          <div>is_electrified : {String(platformData.payload_constraints.is_electrified)}</div>
          <div>passenger_density_limit : {platformData.payload_constraints.passenger_density_limit}</div>
          <div>accessibility_level : {platformData.payload_constraints.accessibility_level}</div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Link to="/" >
          <Button ButtonContent="Back" />
        </Link>

        <Link to={`/stations/${stationId}`}>
          <Button ButtonContent="Stations" />
        </Link>
      </div>
    </motion.div>
  );
};

export default StationPlatformPanel;
