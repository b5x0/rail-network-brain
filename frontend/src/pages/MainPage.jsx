import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import MainPagePanel from '../components/main-page/MainPagePanel'
import TrackMap from '../components/TrackMap/TrackMap'



function MainPage() {

    

    return (
        <DashboardLayout 
            mapContent = {<TrackMap />}
            detectorContent = {<MainPagePanel />}
          />
    )
}

export default MainPage
