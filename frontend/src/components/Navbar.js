import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canViewCustomers, canViewInvoices, getRoleLabel } from "../utils/permissions";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => (location.pathname === path ? "nav-link active" : "nav-link");

  const handleGoHome = (event) => {
    event.preventDefault();
    navigate("/");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { path: "/", label: "Trang chủ", isVisible: true },
    { path: "/categories", label: "Danh mục", isVisible: true },
    { path: "/medicines", label: "Thuốc", isVisible: true },
    { path: "/suppliers", label: "Nhà cung cấp", isVisible: true },
    { path: "/customers", label: "Khách hàng", isVisible: canViewCustomers(user) },
    { path: "/invoices", label: "Hóa đơn", isVisible: canViewInvoices(user) },
  ].filter((item) => item.isVisible);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" onClick={handleGoHome}>
        <span className="logo-icon">PH</span>
        <span className="logo-text">Pharmacy Manager</span>
      </Link>

      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link to={item.path} className={isActive(item.path)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="nav-user-area">
        <div className="nav-user-card">
          <span className="nav-user-name">{user?.fullName || user?.username}</span>
          <span className="nav-user-role">{getRoleLabel(user?.role)}</span>
        </div>

        <button type="button" className="nav-logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
