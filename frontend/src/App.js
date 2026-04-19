import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DarkModeToggle from './components/DarkModeToggle'; 
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Suppliers from './pages/Suppliers';
import './css/style.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <DarkModeToggle />

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;