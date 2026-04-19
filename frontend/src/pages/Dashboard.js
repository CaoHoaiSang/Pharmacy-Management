import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalSuppliers: 0,
    nearExpiry: 0,
    expired: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resMed = await axios.get('http://localhost:5001/Pharmacy-Management/Medicine');
        const resSup = await axios.get('http://localhost:5001/Pharmacy-Management/Supplier');
        
        const medicines = resMed.data;
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30); 

        let expiredCount = 0;
        let nearExpiryCount = 0;

        medicines.forEach(med => {
          const expiryDate = new Date(med.expiryDate);
          if (expiryDate < now) {
            expiredCount++;
          } else if (expiryDate <= thirtyDaysFromNow) {
            nearExpiryCount++;
          }
        });

        setStats({
          totalMedicines: medicines.length,
          totalSuppliers: resSup.data.length,
          nearExpiry: nearExpiryCount,
          expired: expiredCount
        });
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container">
      <div className="header-section">
        <h2 style={{ borderBottom: 'none', marginBottom: '5px' }}>📊 Tổng quan Hệ thống</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          Tình trạng kho thuốc cập nhật đến ngày {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Thẻ 1: Tổng số thuốc */}
        <div className="stat-card card-blue">
          <div className="stat-icon">💊</div>
          <div className="stat-content">
            <h3>Tổng số loại thuốc</h3>
            <p className="stat-number">{stats.totalMedicines}</p>
            {/* Đã thay đổi style link ở đây */}
            <Link to="/medicines" className="stat-link">Xem danh sách</Link>
          </div>
        </div>

        {/* Thẻ 2: Nhà cung cấp */}
        <div className="stat-card card-green">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Nhà cung cấp</h3>
            <p className="stat-number">{stats.totalSuppliers}</p>
            {/* Đã thay đổi style link ở đây */}
            <Link to="/suppliers" className="stat-link">Quản lý đối tác</Link>
          </div>
        </div>

        {/* Thẻ 3: Sắp hết hạn */}
        <div className="stat-card card-yellow">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Sắp hết hạn</h3>
            <p className="stat-number">{stats.nearExpiry}</p>
            <span className="stat-info warning-text">
              Cần nhập hàng mới
            </span>
          </div>
        </div>

        {/* Thẻ 4: Đã hết hạn */}
        <div className="stat-card card-red">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Đã hết hạn</h3>
            <p className="stat-number danger-text">{stats.expired}</p>
            <span className="stat-info danger-text">
              Cần tiêu hủy ngay
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-footer" style={{ marginTop: '60px', textAlign: 'center', opacity: 0.7 }}>
        <p>© 2026 Pharmacy Management System - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Dashboard;