import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  canViewAdminDashboard,
  canViewCustomers,
  canViewInvoices,
  getRoleLabel,
} from "../utils/permissions";

const emptyAdminInsights = {
  revenueToday: 0,
  revenueThisMonth: 0,
  topMedicines: [],
  topCustomers: [],
  recentActivities: [],
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    nearExpiry: 0,
    expired: 0,
  });
  const [adminInsights, setAdminInsights] = useState(emptyAdminInsights);

  const showCustomers = canViewCustomers(user);
  const showInvoices = canViewInvoices(user);
  const showAdminInsights = canViewAdminDashboard(user);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const customerRequest = showCustomers ? api.get("/Customer") : Promise.resolve({ data: [] });
        const invoiceRequest = showInvoices ? api.get("/Invoice") : Promise.resolve({ data: [] });
        const adminDashboardRequest = showAdminInsights
          ? api.get("/Admin/dashboard").catch(() => ({ data: emptyAdminInsights }))
          : Promise.resolve({ data: emptyAdminInsights });

        const [resMed, resSup, resCus, resInv, resAdmin] = await Promise.all([
          api.get("/Medicine"),
          api.get("/Supplier"),
          customerRequest,
          invoiceRequest,
          adminDashboardRequest,
        ]);

        const medicines = resMed.data;
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        let expiredCount = 0;
        let nearExpiryCount = 0;

        medicines.forEach((medicine) => {
          const expiryDate = new Date(medicine.expiryDate);

          if (expiryDate < now) {
            expiredCount += 1;
          } else if (expiryDate <= thirtyDaysFromNow) {
            nearExpiryCount += 1;
          }
        });

        setStats({
          totalMedicines: medicines.length,
          totalSuppliers: resSup.data.length,
          totalCustomers: resCus.data.length,
          totalInvoices: resInv.data.length,
          nearExpiry: nearExpiryCount,
          expired: expiredCount,
        });
        setAdminInsights(resAdmin.data || emptyAdminInsights);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê dashboard:", error);
      }
    };

    fetchStats();
  }, [showCustomers, showInvoices, showAdminInsights]);

  const cards = useMemo(
    () => [
      {
        title: "Tổng số loại thuốc",
        value: stats.totalMedicines,
        icon: "M",
        cardClassName: "card-blue",
        linkTo: "/medicines",
        linkLabel: "Xem danh sách",
      },
      {
        title: "Nhà cung cấp",
        value: stats.totalSuppliers,
        icon: "S",
        cardClassName: "card-green",
        linkTo: "/suppliers",
        linkLabel: "Quản lý đối tác",
      },
      ...(showCustomers
        ? [
            {
              title: "Khách hàng",
              value: stats.totalCustomers,
              icon: "C",
              cardClassName: "card-cyan",
              linkTo: "/customers",
              linkLabel: "Xem khách hàng",
            },
          ]
        : []),
      ...(showInvoices
        ? [
            {
              title: "Hóa đơn",
              value: stats.totalInvoices,
              icon: "I",
              cardClassName: "card-orange",
              linkTo: "/invoices",
              linkLabel: "Theo dõi hóa đơn",
            },
          ]
        : []),
      {
        title: "Sắp hết hạn",
        value: stats.nearExpiry,
        icon: "!",
        cardClassName: "card-yellow",
        infoLabel: "Cần xử lý sớm",
        infoClassName: "warning-text",
        valueClassName: "warning-text",
      },
      {
        title: "Đã hết hạn",
        value: stats.expired,
        icon: "X",
        cardClassName: "card-red",
        infoLabel: "Cần loại bỏ",
        infoClassName: "danger-text",
        valueClassName: "danger-text",
      },
    ],
    [showCustomers, showInvoices, stats]
  );

  return (
    <div className="container">
      <div className="header-section">
        <h2 style={{ borderBottom: "none", marginBottom: "5px" }}>Tổng quan hệ thống</h2>
        <p style={{ color: "#7f8c8d", marginBottom: "30px" }}>
          Tình trạng kho thuốc cập nhật đến ngày {new Date().toLocaleDateString("vi-VN")}
        </p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.title} className={`stat-card ${card.cardClassName}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <p className={`stat-number ${card.valueClassName || ""}`}>{card.value}</p>

              {card.linkTo ? (
                <Link to={card.linkTo} className="stat-link">
                  {card.linkLabel}
                </Link>
              ) : (
                <span className={`stat-info ${card.infoClassName || ""}`}>{card.infoLabel}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAdminInsights && (
        <div className="admin-dashboard-panels">
          <section className="admin-dashboard-section">
            <div className="admin-section-heading">
              <div>
                <h3>Thống kê doanh thu</h3>
                <p>Chỉ hiển thị cho vai trò quản trị viên.</p>
              </div>
            </div>

            <div className="admin-summary-grid">
              <div className="admin-insight-card">
                <span className="admin-insight-label">Doanh thu hôm nay</span>
                <strong className="admin-insight-value">{formatCurrency(adminInsights.revenueToday)}</strong>
              </div>
              <div className="admin-insight-card">
                <span className="admin-insight-label">Doanh thu tháng này</span>
                <strong className="admin-insight-value">{formatCurrency(adminInsights.revenueThisMonth)}</strong>
              </div>
            </div>
          </section>

          <section className="admin-dashboard-section admin-ranking-grid">
            <div className="admin-ranking-card">
              <div className="admin-card-head">
                <h3>Thuốc bán chạy</h3>
                <span>Top 5</span>
              </div>

              {adminInsights.topMedicines.length === 0 ? (
                <p className="admin-empty-state">Chưa có dữ liệu bán hàng.</p>
              ) : (
                <div className="admin-ranking-list">
                  {adminInsights.topMedicines.map((medicine, index) => (
                    <div key={medicine.medicineId || `${medicine.name}-${index}`} className="admin-ranking-item">
                      <div className="admin-ranking-main">
                        <span className="admin-ranking-order">{index + 1}</span>
                        <div>
                          <strong>{medicine.name}</strong>
                          <p>{medicine.category}</p>
                        </div>
                      </div>
                      <div className="admin-ranking-metrics">
                        <span>{medicine.totalQuantity} sản phẩm</span>
                        <strong>{formatCurrency(medicine.totalRevenue)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-ranking-card">
              <div className="admin-card-head">
                <h3>Khách hàng mua nhiều</h3>
                <span>Top 5</span>
              </div>

              {adminInsights.topCustomers.length === 0 ? (
                <p className="admin-empty-state">Chưa có dữ liệu khách hàng mua hàng.</p>
              ) : (
                <div className="admin-ranking-list">
                  {adminInsights.topCustomers.map((customer, index) => (
                    <div key={customer.customerId || `${customer.name}-${index}`} className="admin-ranking-item">
                      <div className="admin-ranking-main">
                        <span className="admin-ranking-order">{index + 1}</span>
                        <div>
                          <strong>{customer.name}</strong>
                          <p>{customer.phone}</p>
                        </div>
                      </div>
                      <div className="admin-ranking-metrics">
                        <span>{customer.invoiceCount} hóa đơn</span>
                        <strong>{formatCurrency(customer.totalSpent)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="admin-dashboard-section">
            <div className="admin-card-head">
              <h3>Nhật ký thao tác</h3>
              <span>Gần nhất</span>
            </div>

            <div className="table-container activity-log-table">
              <table>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Người thao tác</th>
                    <th>Vai trò</th>
                    <th>Nội dung</th>
                    <th>Đối tượng</th>
                  </tr>
                </thead>
                <tbody>
                  {adminInsights.recentActivities.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        Chưa có nhật ký thao tác.
                      </td>
                    </tr>
                  ) : (
                    adminInsights.recentActivities.map((activity) => (
                      <tr key={activity._id || `${activity.action}-${activity.createdAt}`}>
                        <td>{new Date(activity.createdAt).toLocaleString("vi-VN")}</td>
                        <td>{activity.actorName}</td>
                        <td>{getRoleLabel(activity.actorRole)}</td>
                        <td>{activity.details}</td>
                        <td>{activity.entityName || activity.entityType}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      <div className="dashboard-footer" style={{ marginTop: "60px", textAlign: "center", opacity: 0.7 }}>
        <p>{new Date().getFullYear()} Hệ thống quản lý nhà thuốc</p>
      </div>
    </div>
  );
};

export default Dashboard;
