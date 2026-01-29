import React, { useEffect, useState, useRef } from "react";

/**
 * Station component: same approach as Train for position safety.
 */
function Station({
  id,
  name,
  trackId,
  progress = 0,
  selectedStation,
  setSelectedStation,
}) {
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
        const p = Math.max(0, Math.min(1, Number(progress) || 0));
        const point = path.getPointAtLength(length * p);

        if (!cancelled && mountedRef.current) {
          setPosition({ x: point.x, y: point.y });
        }
      } catch (err) {
        rafRef.current = requestAnimationFrame(compute);
      }
    };

    compute();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [trackId, progress]);

  const handleClick = () => {
    if (!selectedStation) {
      setSelectedStation(id);
      // navigate handled by parent (TrackMap wraps router)
      // or you can push here if you want: navigate(`/stations/${id}`)
    }
  };

  if (position.x === null || position.y === null) return null;

  return (
    <g
      onClick={handleClick}
      style={{
        pointerEvents: selectedStation && selectedStation !== id ? "none" : "auto",
        opacity: selectedStation && selectedStation !== id ? 0.5 : 1,
        cursor: selectedStation && selectedStation !== id ? "default" : "pointer",
      }}
    >
      <rect
        x={position.x - 8}
        y={position.y - 8}
        width={16}
        height={16}
        rx={3}
        fill="#111"
        stroke="#fff"
        strokeWidth="2"
      />
      <text
        x={position.x}
        y={position.y - 18}
        textAnchor="middle"
        fontSize="12"
        fill="black"
        pointerEvents="none"
      >
        {name}
      </text>
    </g>
  );
}

export default Station;
