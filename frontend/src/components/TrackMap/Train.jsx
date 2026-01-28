import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

function Train({ id, trackId, progress = 0.5, selectedTrain, setSelectedTrain }) {
  const trainRef = useRef(null)
  const textRef = useRef(null)
  const navigate = useNavigate()
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const path = document.getElementById(trackId)
    if (!path || !trainRef.current || !textRef.current) return

    const length = path.getTotalLength()
    const point = path.getPointAtLength(length * progress)

    trainRef.current.setAttribute("cx", point.x)
    trainRef.current.setAttribute("cy", point.y)
    setPosition({ x: point.x, y: point.y - 20 }) // offset text above the circle
  }, [trackId, progress])

  const handleClick = () => {
    if (!selectedTrain) {
      setSelectedTrain(id)
      navigate(`/trains/${id}`)
    }
  }

  // Determine styles based on selection
  const isOther = selectedTrain && selectedTrain !== id
  const fillColor = "rgb(13,160,13)"
  const opacity = isOther ? 0.5 : 1
  const cursor = isOther ? "default" : "pointer"

  return (
    <>
      {/* Circle */}
      <circle
        ref={trainRef}
        r="15"
        fill={fillColor}
        stroke="white"
        strokeWidth="2"
        className="transition-transform duration-200"
        style={{ transformOrigin: "center", opacity, cursor }}
        onClick={handleClick}
      />

      {/* Train ID above the circle */}
      <text
        ref={textRef}
        x={position.x}
        y={position.y}
        textAnchor="middle"
        fontSize="40"
        fill="black"
        pointerEvents="none" // make text not interfere with clicking
      >
        {id}
      </text>
    </>
  )
}

export default Train
