import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { canCreateInvoices, canDeleteInvoices } from "../utils/permissions";

const API_INVOICE = "/Invoice";
const API_CUSTOMER = "/Customer";
const API_MEDICINE = "/Medicine";
const PAGE_SIZE = 8;

const createEmptyItem = () => ({
  medicineId: "",
  quantity: 1,
  searchTerm: "",
});

const Invoices = () => {
  const { user } = useAuth();
  const canCreate = canCreateInvoices(user);
  const canDelete = canDeleteInvoices(user);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([createEmptyItem()]);
  const [activePickerIndex, setActivePickerIndex] = useState(null);
  const [detail, setDetail] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const closeDetailModal = () => setDetail(null);

  const fetchAll = async () => {
    try {
      const [invoiceRes, customerRes, medicineRes] = await Promise.all([
        api.get(API_INVOICE),
        api.get(API_CUSTOMER),
        api.get(API_MEDICINE),
      ]);

      setInvoices(invoiceRes.data);
      setCustomers(customerRes.data);
      setMedicines(medicineRes.data);
    } catch (error) {
      console.error(error);
      setMsgType("error");
      setMsg("Không thể tải dữ liệu hóa đơn.");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return invoices.slice(startIndex, startIndex + PAGE_SIZE);
  }, [invoices, currentPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [invoices.length, currentPage]);

  useEffect(() => {
    if (!detail) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDetailModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detail]);

  const getMedicineById = (medicineId) => medicines.find((medicine) => medicine._id === medicineId);

  const getFilteredMedicines = (searchTerm) => {
    const keyword = searchTerm.trim().toLowerCase();

    return medicines
      .filter((medicine) => {
        if (!keyword) {
          return true;
        }

        const supplierName =
          medicine.supplierId && typeof medicine.supplierId === "object" ? medicine.supplierId.name || "" : "";

        return `${medicine.name} ${medicine.category} ${supplierName}`.toLowerCase().includes(keyword);
      })
      .slice(0, 8);
  };

  const handleItemChange = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSearchChange = (index, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              searchTerm: value,
              medicineId: "",
            }
          : item
      )
    );
    setActivePickerIndex(index);
  };

  const handleSelectMedicine = (index, medicine) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              medicineId: medicine._id,
              searchTerm: medicine.name,
            }
          : item
      )
    );
    setActivePickerIndex(null);
  };

  const addItem = () => {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
    setActivePickerIndex(items.length);
  };

  const removeItem = (index) => {
    setItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index));
    setActivePickerIndex((currentIndex) => {
      if (currentIndex === index) {
        return null;
      }

      if (currentIndex !== null && currentIndex > index) {
        return currentIndex - 1;
      }

      return currentIndex;
    });
  };

  const closePickerLater = (index) => {
    window.setTimeout(() => {
      setActivePickerIndex((currentIndex) => (currentIndex === index ? null : currentIndex));
    }, 120);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canCreate) {
      return;
    }

    if (!selectedCustomer) {
      setMsgType("error");
      setMsg("Vui lòng chọn khách hàng.");
      return;
    }

    if (items.some((item) => !item.medicineId)) {
      setMsgType("error");
      setMsg("Vui lòng chọn thuốc cho tất cả dòng.");
      return;
    }

    if (items.some((item) => !Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0)) {
      setMsgType("error");
      setMsg("Số lượng phải là số nguyên dương.");
      return;
    }

    setLoading(true);

    try {
      await api.post(API_INVOICE, {
        customerId: selectedCustomer,
        items: items.map((item) => ({
          medicineId: item.medicineId,
          quantity: Number(item.quantity),
        })),
      });

      setMsgType("success");
      setMsg("Tạo hóa đơn thành công.");
      setSelectedCustomer("");
      setItems([createEmptyItem()]);
      setActivePickerIndex(null);
      setCurrentPage(1);
      fetchAll();
    } catch (error) {
      setMsgType("error");
      setMsg(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete || !window.confirm("Bạn có chắc muốn xóa hóa đơn này?")) {
      return;
    }

    try {
      await api.delete(`${API_INVOICE}/${id}`);
      setMsgType("success");
      setMsg("Đã xóa hóa đơn.");
      fetchAll();
    } catch (error) {
      setMsgType("error");
      setMsg(error.response?.data?.message || "Xóa thất bại.");
    }

    setTimeout(() => setMsg(""), 3000);
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await api.get(`${API_INVOICE}/${id}`);
      setDetail(res.data);
    } catch (error) {
      setMsgType("error");
      setMsg("Không thể tải chi tiết hóa đơn.");
    }
  };

  const getInvoiceCustomer = (invoice) => {
    if (invoice.customerId && typeof invoice.customerId === "object" && invoice.customerId.name) {
      return invoice.customerId;
    }

    return null;
  };

  return (
    <div className="container">
      <div className="header-section">
        <h2>Quản lý hóa đơn</h2>
        <p>Tạo hóa đơn bán thuốc và theo dõi các đơn đã xuất trong hệ thống.</p>
      </div>

      {msg && <div className={`alert ${msgType === "error" ? "alert-error" : "alert-success"}`}>{msg}</div>}

      {canCreate && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h3>Tạo hóa đơn mới</h3>
            <div className="invoice-form-stack">
              <div className="form-group-inline">
                <label>Khách hàng</label>
                <select value={selectedCustomer} onChange={(event) => setSelectedCustomer(event.target.value)} required>
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-inline">
                <label>Danh sách thuốc</label>
                <div className="invoice-items-list">
                  {items.map((item, index) => {
                    const filteredMedicines = getFilteredMedicines(item.searchTerm);
                    const selectedMedicine = getMedicineById(item.medicineId);

                    return (
                      <div key={index} className="item-row">
                        <div className="medicine-picker">
                          <div className="medicine-search-bar">
                            <input
                              type="text"
                              value={item.searchTerm}
                              onFocus={() => setActivePickerIndex(index)}
                              onBlur={() => closePickerLater(index)}
                              onChange={(event) => handleSearchChange(index, event.target.value)}
                              placeholder="Nhập tên thuốc để tìm nhanh..."
                            />
                            <button
                              type="button"
                              className="btn-search-inline"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => setActivePickerIndex(index)}
                            >
                              Tìm
                            </button>
                          </div>

                          {selectedMedicine && (
                            <div className="medicine-picker-summary">
                              Đã chọn: <strong>{selectedMedicine.name}</strong> - Tồn: {selectedMedicine.stock} - Giá:{" "}
                              {selectedMedicine.price?.toLocaleString("vi-VN")} đ
                            </div>
                          )}

                          {activePickerIndex === index && (
                            <div className="medicine-picker-dropdown">
                              {filteredMedicines.length === 0 ? (
                                <div className="medicine-picker-empty">Không tìm thấy thuốc phù hợp.</div>
                              ) : (
                                filteredMedicines.map((medicine) => (
                                  <button
                                    key={medicine._id}
                                    type="button"
                                    className="medicine-picker-option"
                                    onMouseDown={(event) => {
                                      event.preventDefault();
                                      handleSelectMedicine(index, medicine);
                                    }}
                                  >
                                    <strong>{medicine.name}</strong>
                                    <span className="medicine-option-meta">
                                      {medicine.category} - Tồn: {medicine.stock} - Giá:{" "}
                                      {medicine.price?.toLocaleString("vi-VN")} đ
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) => handleItemChange(index, "quantity", event.target.value)}
                          placeholder="Số lượng"
                        />

                        {items.length > 1 && (
                          <button type="button" className="btn-delete small-btn" onClick={() => removeItem(index)}>
                            Xóa dòng
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-inline-actions">
                <button type="button" className="btn-import" onClick={addItem}>
                  + Thêm thuốc
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Tạo hóa đơn"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!canCreate && <div className="alert alert-success">Tài khoản này chỉ được xem hóa đơn.</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã hóa đơn</th>
              <th>Khách hàng</th>
              <th>Số mặt hàng</th>
              <th>Tổng tiền</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Chưa có hóa đơn nào
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((invoice) => {
                const customer = getInvoiceCustomer(invoice);

                return (
                  <tr key={invoice._id}>
                    <td>{invoice.invoiceId || "Không có"}</td>
                    <td>{customer?.name || "Khách hàng cũ"}</td>
                    <td>{invoice.items?.length || 0} mặt hàng</td>
                    <td>{invoice.totalAmount?.toLocaleString("vi-VN")} đ</td>
                    <td>{new Date(invoice.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleViewDetail(invoice._id)}>
                        Chi tiết
                      </button>
                      {canDelete && (
                        <button className="btn-delete" onClick={() => handleDelete(invoice._id)}>
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={invoices.length}
        onPageChange={setCurrentPage}
        itemLabel="hóa đơn"
      />

      {detail && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content invoice-detail-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeDetailModal}>
              ×
            </button>

            <div className="invoice-modal-header">
              <div>
                <h3>Chi tiết hóa đơn</h3>
                <p>
                  Mã hóa đơn: <strong>{detail.invoiceId}</strong>
                </p>
              </div>
            </div>

            <div className="invoice-meta-grid">
              <div className="invoice-meta-item">
                <span>Khách hàng</span>
                <strong>{detail.customerId?.name || "Không có"}</strong>
              </div>
              <div className="invoice-meta-item">
                <span>Số điện thoại</span>
                <strong>{detail.customerId?.phone || "-"}</strong>
              </div>
              <div className="invoice-meta-item">
                <span>Email</span>
                <strong>{detail.customerId?.email || "-"}</strong>
              </div>
              <div className="invoice-meta-item">
                <span>Ngày tạo</span>
                <strong>{new Date(detail.createdAt).toLocaleString("vi-VN")}</strong>
              </div>
            </div>

            <div className="table-container invoice-modal-table">
              <table>
                <thead>
                  <tr>
                    <th>Thuốc</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items?.map((item) => (
                    <tr key={item._id || item.medicineId?._id || item.medicineId}>
                      <td>{item.medicineId?.name || "Không có"}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price?.toLocaleString("vi-VN")} đ</td>
                      <td>{item.subtotal?.toLocaleString("vi-VN")} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-modal-total">Tổng cộng: {detail.totalAmount?.toLocaleString("vi-VN")} đ</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
