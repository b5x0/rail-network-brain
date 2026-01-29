import React , { useState } from 'react'
import {Routes , Route} from "react-router-dom"

// pages importation
import MainPage from './pages/MainPage'
import Trains from './pages/Trains'
import Stations from './pages/Stations'
import Schedules from "./pages/Schedules"

function App() {


  


  return (
    <>

      <Routes>
        <Route path='/' element={
          <MainPage />
        }/>

        <Route path='/trains/*' element={
          <Trains />
        }/>


        <Route path='/stations/*' element={
          <Stations />
        }/>


        <Route path='/schedules/*' element={
          <Schedules />
        }/>


      </Routes>

      
    </>
  )
}

export default App