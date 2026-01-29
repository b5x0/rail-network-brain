import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Station({
  id,
  name,
  trackId,
  progress = 0.5,
  selectedStation,
  setSelectedStation,
}) {
  const stationRef = useRef(null);
  const textRef = useRef(null);
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const path = document.getElementById(trackId);
    if (!path || !stationRef.current || !textRef.current) return;

    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * progress);

    stationRef.current.setAttribute("cx", point.x);
    stationRef.current.setAttribute("cy", point.y);

    // Offset text above circle
    setPosition({ x: point.x, y: point.y - 15 });
  }, [trackId, progress]);

  const handleClick = () => {
    if (!selectedStation) {
      setSelectedStation(id);
      navigate(`/stations/${id}`);
    }
  };

  // Same selection logic as Train
  const isOther = selectedStation && selectedStation !== id;
  const fillColor = "rgb(13,160,13)";
  const opacity = isOther ? 0.5 : 1;
  const cursor = isOther ? "default" : "pointer";

  return (
    <>
      {/* Station circle */}
      <circle
        ref={stationRef}
        r="12"
        fill={fillColor}
        stroke="white"
        strokeWidth="2"
        className="transition-transform duration-200"
        style={{ transformOrigin: "center", opacity, cursor }}
        onClick={handleClick}
      />

      {/* Station name */}
      <text
        ref={textRef}
        x={position.x}
        y={position.y}
        fontSize="30"           // smaller font
        fill="black"
        textAnchor="middle"     // center horizontally
        pointerEvents="none"
        className=""
      >
        {name}
      </text>
    </>
  );
}

export default Station;
