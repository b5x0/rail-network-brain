import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getOptions, executeOption } from "../services/api";

function CollisionAlert({ alert }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (alert) {
      fetchOptions();
    }
  }, [alert]);

  const fetchOptions = async () => {
    try {
      const opts = await getOptions();
      setOptions(opts);
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

  const handleResolve = async (option) => {
    setLoading(true);
    try {
      await executeOption(alert.id, option.train, option.action);
      console.log("✅ Resolution executed:", option.action);
    } catch (err) {
      console.error("❌ Error executing resolution:", err);
    }
    setLoading(false);
  };

  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-red-50 border-2 border-red-600 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
      >
        {/* ================== COLLISION INFO BLOCK ================== */}
        <div className="bg-red-100 p-6 border-b-2 border-red-600">
          <h2 className="text-3xl font-bold text-red-800 text-center mb-4">
            🚨 COLLISION ALERT
          </h2>
          <div className="font-mono text-sm space-y-2">
            <div>
              <span className="font-semibold">Location:</span> {alert.location}
            </div>
            <div>
              <span className="font-semibold">Trains involved:</span>
              <ul className="list-disc pl-6 mt-1">
                {alert.trains.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2 font-bold text-red-700">
              ⚠️ Priority: {alert.priority || "High"}
            </div>
          </div>
        </div>

        {/* ================== SOLUTIONS BLOCK ================== */}
        <div className="font-light bg-white p-6 flex flex-col gap-3">
          {options.length === 0 && (
            <div className="text-center text-gray-500">
              Waiting for SOLUTIONS ...
            </div>
          )}
          {options.map((opt, i) => (
            <button
              key={i}
              disabled={loading}
              onClick={() => handleResolve(opt)}
              className="w-full p-3 bg-blue-300 text-black rounded-xl hover:bg-blue-500 disabled:opacity-50 transition"
            >
              <div className="font-bold">{opt.action}</div>
              <div className="text-xs opacity-80">
                Train: {opt.train} — {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default CollisionAlert;
