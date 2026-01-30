import React from "react"

const positionClasses = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
}

function Nail({ position = "top-left" }) {
  return (
    <div className={`absolute ${positionClasses[position]} z-20`}>
      <div
        className="
          w-5 h-5 rounded-full
          bg-gradient-to-br from-gray-200 via-gray-400 to-gray-700
          shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),inset_0_-2px_3px_rgba(0,0,0,0.85),0_2px_3px_rgba(0,0,0,0.8)]
          flex items-center justify-center
        "
      >
        {/* X-slot */}
        <div className="relative w-3 h-3">
          <div className="absolute top-1/2 w-full h-[2px] bg-black/70 rotate-45" />
          <div className="absolute top-1/2 w-full h-[2px] bg-black/70 -rotate-45" />
        </div>
      </div>
    </div>
  )
}

export default Nail
