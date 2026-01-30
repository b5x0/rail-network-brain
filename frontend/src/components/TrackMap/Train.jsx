import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * Train component
 * - Reads SVG path by trackId
 * - Computes (x,y) from progress [0..1]
 * - Renders train + ID label ABOVE it
 */
function Train({
  id,
  trackId,
  progress = 0,
  selectedTrain,
  setSelectedTrain,
  mode = "default",
}) {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: null, y: null });
  const rafRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const clampProgress = (p) => {
    const n = Number(p);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  };

  useEffect(() => {
    let cancelled = false;

    const compute = () => {
      const path = document.getElementById(trackId);
      if (!path) {
        rafRef.current = requestAnimationFrame(compute);
        return;
      }

      try {
        const length = path.getTotalLength();
        const safeP = clampProgress(progress);
        const point = path.getPointAtLength(length * safeP);

        if (!cancelled && mountedRef.current) {
          setPosition({ x: point.x, y: point.y });

          console.debug(
            `[Train ${id}] progress=${safeP.toFixed(3)} → (${Math.round(
              point.x
            )}, ${Math.round(point.y)})`
          );
        }
      } catch {
        rafRef.current = requestAnimationFrame(compute);
      }
    };

    compute();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackId, progress, id]);

  const handleClick = () => {
    if (selectedTrain && selectedTrain !== id) return;
    setSelectedTrain(id);
    navigate(mode === "schedule" ? `/schedules/${id}/schedule` : `/trains/${id}`);
  };

  const isOtherSelected = selectedTrain && selectedTrain !== id;

  if (position.x === null || position.y === null) return null;

  return (
    <g
      onClick={handleClick}
      style={{
        cursor: isOtherSelected ? "default" : "pointer",
        opacity: isOtherSelected ? 0.35 : 1,
        pointerEvents: isOtherSelected ? "none" : "auto",
      }}
    >
      {/* 🚆 Train */}
      <motion.circle
        cx={position.x}
        cy={position.y}
        r={mode === "default" ? 14 : 10}
        fill="rgb(13,160,13)"
        stroke="white"
        strokeWidth={2}
        animate={{ cx: position.x, cy: position.y }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      />

      {/* 🏷 Train ID ABOVE */}
      <motion.g
        animate={{ x: position.x, y: position.y - 26 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        pointerEvents="none"
      >
        
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={32}
          fontWeight=""
          fill="black"
          className="font-mono"
        >
          {id}
        </text>
      </motion.g>
    </g>
  );
}

export default Train;
