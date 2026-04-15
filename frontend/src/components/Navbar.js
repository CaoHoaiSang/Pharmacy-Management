import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">💊 Pharmacy Manager</div>
      <ul className="nav-links">
        <li><Link to="/">Trang chủ</Link></li>
        <li><Link to="/medicines">Quản lý Thuốc</Link></li>
        <li><Link to="/suppliers">Nhà cung cấp</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;