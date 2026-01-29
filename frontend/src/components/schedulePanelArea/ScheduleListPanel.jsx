import React from "react";
import { motion } from "framer-motion";

function ScheduleListPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h1 className="text-4xl">Click on a train to display the schedule.</h1>
    </motion.div>
  );
}

export default ScheduleListPanel;
