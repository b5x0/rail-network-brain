import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nail from "../components/ui/Nail";

function DashboardLayout({ mapContent, detectorContent , autoStart = false }) {
  const [running, setRunning] = useState(false);

  // ===== Auto-start simulation when page mounts =====
  useEffect(() => {
    if (autoStart) setRunning(true);
  }, [autoStart]);

  const onStart = () => setRunning(true);
  const onStop = () => setRunning(false);

  const redirectToRepo = () => {
    window.open(
      "https://github.com/b5x0/rail-network-brain",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#1a1a1a] overflow-hidden">
      <div className="relative inline-block max-w-full max-h-screen">
        <img
          src="./dashboard.png"
          alt="dashboard"
          className="block max-h-screen w-auto"
        />

        <div className="absolute inset-0 flex box-border px-[5%] py-[7%] gap-[2%]">
          {/* ===== RADAR ===== */}
          <div className=" relative w-[55%] h-full self-center flex items-center justify-center bg-[#0b0b0b] rounded-[10%] shadow-[inset_0_0_20px_rgba(255,255,255,0.08),0_15px_35px_rgba(0,0,0,0.7)]">
            <Nail position="top-left" />
            <Nail position="top-right" />
            <Nail position="bottom-left" />
            <Nail position="bottom-right" />

            <div className="w-[90%] h-[95%] flex justify-center items-center rounded-full bg-gray-300 relative overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.4),inset_0_0_60px_rgba(0,0,0,0.25)]">
              <AnimatePresence>
                {running && (
                  typeof mapContent === "string" ? (
                    <motion.img
                      key="map-img"
                      src={mapContent}
                      alt="map"
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.6 }}
                    />
                  ) : (
                    <motion.div
                      key="map-jsx"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full"
                    >
                      {mapContent}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ===== CONTROL PANEL ===== */}
          <div className="w-[15%] h-full self-center flex flex-col justify-between p-2">
            <div className="flex flex-col gap-6">
              <button
                onClick={onStart}
                className="group flex flex-col items-center text-white select-none cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full cursor-pointer translate-y-[8px] blur-sm" />
                  <img
                    src="./blubu.png"
                    alt="start"
                    className="relative w-[110px] h-[110px] transition-all duration-150 ease-out active:translate-y-[6px] active:scale-[0.96]"
                  />
                </div>
                <span className="font-michroma tracking-widest text-sm mt-1">
                  START
                </span>
              </button>

              <button
                onClick={onStop}
                className="group flex flex-col items-center text-white select-none cursor-pointer"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full translate-y-[8px] blur-sm" />
                  <img
                    src="./redbu.png"
                    alt="stop"
                    className="relative w-[110px] h-[110px] transition-all duration-150 ease-out active:translate-y-[6px] active:scale-[0.96]"
                  />
                </div>
                <span className="font-michroma tracking-widest text-sm mt-1">
                  STOP
                </span>
              </button>
            </div>

            <button
              onClick={redirectToRepo}
              className="group flex flex-col items-center text-white select-none cursor-pointer"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full translate-y-[8px] blur-sm" />
                <img
                  src="./yellowbut.png"
                  alt="github"
                  className="relative w-[110px] h-[110px] transition-all duration-150 ease-out active:translate-y-[6px] active:scale-[0.96]"
                />
              </div>
              <span className="font-michroma tracking-widest text-sm mt-2">
                GITHUB
              </span>
            </button>
          </div>

          {/* ===== DETECTOR ===== */}
          <div className="flex items-center flex-col py-4 w-[35%] h-full self-center relative overflow-hidden bg-gray-400 rounded-[40px] border-[4px] border-[#444] shadow-[inset_0_0_30px_rgba(255,255,255,0.8),0_0_15px_rgba(255,255,255,0.3)] font-vt323">
            <AnimatePresence>
              {running && (
                <motion.div
                  key="detector-panel"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 h-full flex flex-col"
                >
                  {detectorContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
