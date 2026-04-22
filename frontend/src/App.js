import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import DarkModeToggle from "./components/DarkModeToggle";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Medicines from "./pages/Medicines";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";
import "./css/style.css";

const AppShell = () => {
  const { user } = useAuth();

  return (
    <div className="App">
      {user && <Navbar />}
      <DarkModeToggle />

      <div className="content">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/suppliers" element={<Suppliers />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
            <Route path="/customers" element={<Customers />} />
            <Route path="/invoices" element={<Invoices />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

export default App;
