import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

function Train({
  id,
  trackId,
  progress = 0.5,
  selectedTrain,
  setSelectedTrain,
  mode = "default",
}) {
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
    setPosition({ x: point.x, y: point.y - 20 })
  }, [trackId, progress])

  const handleClick = () => {
    if (!selectedTrain) {
      setSelectedTrain(id)

      if (mode === "schedule") {
        navigate(`/schedules/${id}/schedule`)
      } else {
        navigate(`/trains/${id}`)
      }
    }
  }

  const isOther = selectedTrain && selectedTrain !== id

  return (
    <>
      <circle
        ref={trainRef}
        r="15"
        fill="rgb(13,160,13)"
        stroke="white"
        strokeWidth="2"
        style={{
          opacity: isOther ? 0.4 : 1,
          cursor: isOther ? "default" : "pointer",
        }}
        onClick={handleClick}
      />

      <text
        ref={textRef}
        x={position.x}
        y={position.y}
        textAnchor="middle"
        fontSize="40"
        fill="black"
        pointerEvents="none"
      >
        {id}
      </text>
    </>
  )
}

export default Train
