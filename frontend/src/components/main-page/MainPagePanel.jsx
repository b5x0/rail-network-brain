import React from "react"
import { Link } from "react-router-dom"
import Button from "../ui/Button"

function MainPagePanel() {
  return (
    <>
      <h1 className="text-4xl mb-5 text-center">
        Click on a Button to start.
      </h1>

      {/* buttons */}
      <div className="flex flex-col gap-4">
        <Link to="/trains">
          <Button ButtonContent="Trains" />
        </Link>

        <Link to="/stations">
          <Button ButtonContent="Stations & Platforms" />
        </Link>

        <Link to="/schedules">
          <Button ButtonContent="Schedules" />
        </Link>
      </div>
    </>
  )
}

export default MainPagePanel
