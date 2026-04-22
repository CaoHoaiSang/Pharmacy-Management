import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { canDeleteCustomers, canManageCustomers } from "../utils/permissions";

const API_URL = "/Customer";
const PAGE_SIZE = 8;

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

const Customers = () => {
  const { user } = useAuth();
  const canEdit = canManageCustomers(user);
  const canDelete = canDeleteCustomers(user);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(API_URL);
      setCustomers(res.data);
    } catch (error) {
      console.error(error);
      setMsgType("error");
      setMsg("Không thể tải danh sách khách hàng.");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return customers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [customers, currentPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [customers.length, currentPage]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, formData);
        setMsgType("success");
        setMsg("Cập nhật khách hàng thành công.");
      } else {
        await api.post(API_URL, formData);
        setMsgType("success");
        setMsg("Thêm khách hàng thành công.");
      }

      resetForm();
      setCurrentPage(1);
      fetchCustomers();
    } catch (error) {
      setMsgType("error");
      setMsg(error.response?.data?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const prepareEdit = (customer) => {
    if (!canEdit) {
      return;
    }

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setEditingId(customer._id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!canDelete || !window.confirm("Bạn có chắc muốn xóa khách hàng này?")) {
      return;
    }

    try {
      await api.delete(`${API_URL}/${id}`);
      setMsgType("success");
      setMsg("Đã xóa khách hàng.");
      fetchCustomers();
    } catch (error) {
      setMsgType("error");
      setMsg(error.response?.data?.message || "Xóa thất bại.");
    }

    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="container">
      <div className="header-section">
        <h2>Quản lý khách hàng</h2>
        <p>Thêm mới, cập nhật và theo dõi thông tin khách hàng trong hệ thống.</p>
      </div>

      {msg && <div className={`alert ${msgType === "error" ? "alert-error" : "alert-success"}`}>{msg}</div>}

      {canEdit ? (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h3>{editingId ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}</h3>
            <div className="grid-form">
              <input
                type="text"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                required
              />
              <div className="form-inline-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Đang xử lý..." : editingId ? "Cập nhật" : "Lưu khách hàng"}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary-action" onClick={resetForm}>
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="alert alert-success">Tài khoản này chỉ được xem danh sách khách hàng.</div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ tên</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Chưa có khách hàng nào
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.customerId || "Tự sinh"}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td>{customer.address}</td>
                  <td>
                    {canEdit && (
                      <button className="btn-edit" onClick={() => prepareEdit(customer)}>
                        Sửa
                      </button>
                    )}
                    {canDelete && (
                      <button className="btn-delete" onClick={() => handleDelete(customer._id)}>
                        Xóa
                      </button>
                    )}
                    {!canEdit && !canDelete && <span>Chỉ được xem</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={customers.length}
        onPageChange={setCurrentPage}
        itemLabel="khách hàng"
      />
    </div>
  );
};

export default Customers;
