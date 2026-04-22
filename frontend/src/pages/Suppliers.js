import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { canManageSuppliers } from "../utils/permissions";

const API_URL = "/Supplier";

const Suppliers = () => {
  const { user } = useAuth();
  const canEdit = canManageSuppliers(user);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get(API_URL);
      setSuppliers(res.data);
    } catch (error) {
      setMessageType("error");
      setMessage("Không thể tải danh sách nhà cung cấp.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    try {
      if (isEditing) {
        await api.put(`${API_URL}/${currentId}`, formData);
        setMessageType("success");
        setMessage("Cập nhật nhà cung cấp thành công.");
      } else {
        await api.post(API_URL, formData);
        setMessageType("success");
        setMessage("Thêm nhà cung cấp thành công.");
      }

      resetForm();
      fetchSuppliers();
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Không thể lưu nhà cung cấp.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", address: "" });
    setIsEditing(false);
    setCurrentId(null);
  };

  const prepareEdit = (supplier) => {
    if (!canEdit) {
      return;
    }

    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setIsEditing(true);
    setCurrentId(supplier._id);
    window.scrollTo(0, 0);
  };

  const deleteSupplier = async (id) => {
    if (!canEdit || !window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      return;
    }

    try {
      await api.delete(`${API_URL}/${id}`);
      setMessageType("success");
      setMessage("Đã xóa nhà cung cấp.");
      fetchSuppliers();
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Không thể xóa nhà cung cấp.");
    }
  };

  return (
    <div className="container">
      <div className="header-section">
        <h2>Quản lý nhà cung cấp</h2>
        <p>Theo dõi thông tin đối tác cung cấp thuốc cho hệ thống.</p>
      </div>

      {message && (
        <div className={`alert ${messageType === "error" ? "alert-error" : "alert-success"}`}>
          {message}
        </div>
      )}

      {canEdit ? (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h3>Thông tin nhà cung cấp</h3>
            <div className="grid-form">
              <input
                type="text"
                placeholder="Tên nhà cung cấp"
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
                placeholder="Email liên hệ"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={(event) => setFormData({ ...formData, address: event.target.value })}
              />

              <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
                <button type="submit" className="btn-save">
                  {isEditing ? "Cập nhật" : "Lưu nhà cung cấp"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-delete"
                    style={{ marginLeft: "10px" }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="alert alert-success">Tài khoản này chỉ được xem danh sách nhà cung cấp.</div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên công ty</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>
                  <strong>{supplier.name}</strong>
                </td>
                <td>{supplier.phone}</td>
                <td>{supplier.email || <i style={{ color: "#ccc" }}>Chưa cập nhật</i>}</td>
                <td>{supplier.address || "Không có"}</td>
                <td>
                  {canEdit ? (
                    <>
                      <button onClick={() => prepareEdit(supplier)} className="btn-edit">
                        Sửa
                      </button>
                      <button onClick={() => deleteSupplier(supplier._id)} className="btn-delete">
                        Xóa
                      </button>
                    </>
                  ) : (
                    <span>Chỉ được xem</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;
