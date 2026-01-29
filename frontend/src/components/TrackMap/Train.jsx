import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * Train component
 * - Computes position from SVG path (by id)
 * - Waits for path to exist before computing to avoid undefined cx/cy
 * - Recomputes on progress prop changes
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

  // Helper: safe number progress in [0,1]
  const safeProgress = (p) => {
    const n = Number(p);
    if (Number.isFinite(n)) return Math.max(0, Math.min(1, n));
    return 0;
  };

  // Compute position; if path doesn't exist yet, poll via rAF until found.
  useEffect(() => {
    let cancelled = false;

    const compute = () => {
      const path = document.getElementById(trackId);
      if (!path) {
        // retry next frame
        rafRef.current = requestAnimationFrame(compute);
        return;
      }

      try {
        const length = path.getTotalLength();
        const p = safeProgress(progress);
        const point = path.getPointAtLength(length * p);

        if (!cancelled && mountedRef.current) {
          setPosition({ x: point.x, y: point.y });
          // Debug log so you can see progress updates
          // (will be visible in browser console)
          // eslint-disable-next-line no-console
          console.debug(`[Train:${id}] progress=${p} -> x=${Math.round(point.x)}, y=${Math.round(point.y)}`);
        }
      } catch (err) {
        // Some SVG path shapes may throw until rendered -- retry
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
    if (!selectedTrain) {
      setSelectedTrain(id);
      if (mode === "schedule") navigate(`/schedules/${id}/schedule`);
      else navigate(`/trains/${id}`);
    }
  };

  const isOther = selectedTrain && selectedTrain !== id;

  // If position not computed yet, don't render the train (avoids cx="undefined")
  if (position.x === null || position.y === null) return null;

  return (
    <g
      onClick={handleClick}
      style={{
        pointerEvents: isOther ? "none" : "auto",
        opacity: isOther ? 0.4 : 1,
        cursor: isOther ? "default" : "pointer",
      }}
    >
      <motion.circle
        cx={position.x}
        cy={position.y}
        r={mode === "default" ? 12 : 9}
        fill="rgb(13,160,13)"
        stroke="white"
        strokeWidth="2"
        animate={{ cx: position.x, cy: position.y }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />

      <motion.text
        x={position.x}
        y={position.y - 18}
        textAnchor="middle"
        fontSize="16"
        fill="black"
        pointerEvents="none"
        animate={{ x: position.x, y: position.y - 18 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {id}
      </motion.text>
    </g>
  );
}

export default Train;
