import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Station component
 * - Blue circle
 * - Station name above
 * - Click navigates to /stations/:id
 */
function Station({
  id,
  name,
  trackId,
  progress = 0,
  selectedStation,
  setSelectedStation,
}) {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: null, y: null });
  const rafRef = useRef(null);
  const mountedRef = useRef(true);

  /* ------------------ lifecycle safety ------------------ */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ------------------ helpers ------------------ */
  const clampProgress = (p) => {
    const n = Number(p);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  };

  /* ------------------ compute position ------------------ */
  useEffect(() => {
    let cancelled = false;

    const computePosition = () => {
      const path = document.getElementById(trackId);

      if (!path) {
        rafRef.current = requestAnimationFrame(computePosition);
        return;
      }

      try {
        const length = path.getTotalLength();
        const p = clampProgress(progress);
        const point = path.getPointAtLength(length * p);

        if (!cancelled && mountedRef.current) {
          setPosition({ x: point.x, y: point.y });
        }
      } catch {
        rafRef.current = requestAnimationFrame(computePosition);
      }
    };

    computePosition();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackId, progress]);

  /* ------------------ interaction ------------------ */
  const handleClick = () => {
    if (selectedStation && selectedStation !== id) return;

    setSelectedStation(id);
    navigate(`/stations/${id}`);
  };

  const isOtherSelected = selectedStation && selectedStation !== id;

  /* ------------------ guard render ------------------ */
  if (position.x === null || position.y === null) return null;

  /* ------------------ render ------------------ */
  return (
    <g
      onClick={handleClick}
      style={{
        cursor: isOtherSelected ? "default" : "pointer",
        opacity: isOtherSelected ? 0.4 : 1,
        pointerEvents: isOtherSelected ? "none" : "auto",
      }}
    >
      {/* 🏷 Station name */}
      <text
        x={position.x}
        y={position.y - 18}
        textAnchor="middle"
        fontSize="28"
        fill="black"
        pointerEvents="none"
      >
        {name}
      </text>

      {/* 🔵 Station circle */}
      <circle
        cx={position.x}
        cy={position.y}
        r={14}
        fill="#2f80ff"
        stroke="white"
        strokeWidth={3}
      />
    </g>
  );
}

export default Station;
