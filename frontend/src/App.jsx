import React , { useState } from 'react'
import {Routes , Route} from "react-router-dom"

// pages importation
import MainPage from './pages/MainPage'
import Trains from './pages/Trains'
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


      </Routes>

      
    </>
  )
}

export default App