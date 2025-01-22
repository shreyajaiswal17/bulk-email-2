import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Demo from "./Demo";
import Homepage from "./Homepage";
import AuthForm from "./Login";
import EmailAnalyticsDashboard from "./EmailAnalytics";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage for authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    console.log("Checking auth status on mount:", authStatus);
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    console.log("User  logged in, isAuthenticated:", true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    console.log("User  logged out, isAuthenticated:", false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm onLogin={handleLogin} />} />
        {console.log("Is Authenticated:", isAuthenticated)}
        <Route path="/home" element= {<Homepage/>} />
      <Route path="/demo" element={<Demo/>} />
        <Route path="/email-analytics" element= {<EmailAnalyticsDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;