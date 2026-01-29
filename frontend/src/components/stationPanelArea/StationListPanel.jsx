import React from "react";
import { motion } from "framer-motion";

function StationListPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h1 className="text-4xl">Click on a station to display more info.</h1>
    </motion.div>
  );
}

export default StationListPanel;
