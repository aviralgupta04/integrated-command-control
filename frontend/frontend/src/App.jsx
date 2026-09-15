import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header"

import Devices from "./pages/Devices"
import LiveView from "./pages/LiveView"
import DashBoard from "./pages/DashBoard"
import Settings from "./pages/Settings"

function App() {
  

  return (
   
    <>
     <Header />
        <Routes>
        <Route path="/" element = {<Devices />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/liveview" element={<LiveView />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      
   </>
  );
}

export default App
