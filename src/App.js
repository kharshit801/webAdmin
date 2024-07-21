import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "./App.css";
import logo from "./logo.png";
import ClassScheduleManagement from "./ClassScheduleManagement";
import AttendanceReport from './AttendanceReport';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="Institute Logo" className="App-logo" />
          <h1>Institute Management System</h1>
        </header>
        
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/class-schedule">Class Schedule Management</Link></li>
            <li><Link to="/attendance">Attendance Report</Link></li>
          </ul>
        </nav>
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/class-schedule" element={<ClassScheduleManagement />} />
            <Route path="/attendance" element={<AttendanceReport />} />
          </Routes>
        </main>
        
        <footer>
          <p>&copy; 2024 MOTILAL NEHRU NATIONAL INSTITUTE OF TECHNOLOGY. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home">
      <h2>Welcome to MNNIT</h2>
      <p>Made by Team Auxin</p>
    </div>
  );
}

export default App;