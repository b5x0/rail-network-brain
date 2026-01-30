import React, { useEffect } from "react"
import { startSimulation } from "../services/api"

function SimulationDebug() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await startSimulation()
        console.log("✅ Start simulation:", data)
      } catch (err) {
        console.error("❌ API error:", err)
      }
    }

    fetchData()
  }, [])

  return <div className="text-white">Check console for API result</div>
}

export default SimulationDebug
