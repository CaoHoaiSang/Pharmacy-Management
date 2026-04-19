import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span className="logo-icon">💊</span>
        <span className="logo-text">Pharmacy Manager</span>
      </div>
      <ul className="nav-links">
        <li><Link to="/" className="nav-link">Trang chủ</Link></li>
        <li><Link to="/medicines" className="nav-link">Quản lý Thuốc</Link></li>
        <li><Link to="/suppliers" className="nav-link">Nhà cung cấp</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;