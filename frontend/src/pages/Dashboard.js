import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ medicines: 0, suppliers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resMed = await axios.get('http://localhost:5001/Pharmacy-Management/Medicine');
        const resSup = await axios.get('http://localhost:5001/Pharmacy-Management/Supplier');
        setStats({ medicines: resMed.data.length, suppliers: resSup.data.length });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container">
      <div className="header-section">
        <h2>📊 Tổng quan Hệ thống</h2>
        <p>Chào mừng Sang trở lại! Dưới đây là tình hình kho dược hiện tại.</p>
      </div>

      <div className="dashboard-grid">
        {/* Thẻ Thuốc */}
        <div className="stat-card card-blue">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <h3>Tổng số loại thuốc</h3>
            <p className="stat-number">{stats.medicines}</p>
            <Link to="/medicines" className="stat-link">Xem chi tiết →</Link>
          </div>
        </div>

        {/* Thẻ Nhà cung cấp */}
        <div className="stat-card card-green">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Nhà cung cấp đối tác</h3>
            <p className="stat-number">{stats.suppliers}</p>
            <Link to="/suppliers" className="stat-link">Quản lý đối tác →</Link>
          </div>
        </div>

        {/* Thẻ Giả lập (Cho đẹp giao diện) */}
        <div className="stat-card card-yellow">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Thuốc sắp hết hạn</h3>
            <p className="stat-number">3</p>
            <span className="stat-info">Cần kiểm tra ngay</span>
          </div>
        </div>
      </div>

      <div className="dashboard-footer" style={{ marginTop: '40px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>© 2026 Pharmacy Management System - Cao Hoài Sang & Đỗ kiều Oanh</p>
      </div>
    </div>
  );
};

export default Dashboard;