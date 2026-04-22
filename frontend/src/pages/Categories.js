import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { canManageCategories } from "../utils/permissions";

const API_URL = "/Category";

const emptyForm = {
  name: "",
  description: "",
};

const Categories = () => {
  const { user } = useAuth();
  const canEdit = canManageCategories(user);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const fetchCategories = async () => {
    try {
      const response = await api.get(API_URL);
      setCategories(response.data);
    } catch (error) {
      setMessageType("error");
      setMessage("Không thể tải danh sách danh mục.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, formData);
        setMessageType("success");
        setMessage("Cập nhật danh mục thành công.");
      } else {
        await api.post(API_URL, formData);
        setMessageType("success");
        setMessage("Thêm danh mục thành công.");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Không thể lưu danh mục.");
    }
  };

  const handleEdit = (category) => {
    if (!canEdit) {
      return;
    }

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
    setEditingId(category._id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (category) => {
    if (!canEdit || !window.confirm(`Bạn có chắc muốn xóa danh mục ${category.name}?`)) {
      return;
    }

    try {
      await api.delete(`${API_URL}/${category._id}`);
      setMessageType("success");
      setMessage("Xóa danh mục thành công.");
      fetchCategories();
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Không thể xóa danh mục.");
    }
  };

  return (
    <div className="container">
      <div className="header-section">
        <h2>Quản lý danh mục</h2>
        <p>Quản lý các nhóm thuốc dùng chung để tránh nhập lệch tên và hỗ trợ thống kê.</p>
      </div>

      {message && (
        <div className={`alert ${messageType === "error" ? "alert-error" : "alert-success"}`}>
          {message}
        </div>
      )}

      {canEdit ? (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h3>{editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
            <div className="grid-form">
              <input
                type="text"
                placeholder="Tên danh mục"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Mô tả ngắn"
                value={formData.description}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, description: event.target.value }))
                }
              />

              <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
                <button type="submit" className="btn-save">
                  {editingId ? "Cập nhật" : "Lưu danh mục"}
                </button>
                {editingId && (
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
        <div className="alert alert-success">Tài khoản này chỉ được xem danh sách danh mục.</div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Số thuốc</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>{category.description || "Chưa có mô tả"}</td>
                  <td>{category.medicineCount || 0}</td>
                  <td>
                    {canEdit ? (
                      <>
                        <button onClick={() => handleEdit(category)} className="btn-edit">
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(category)} className="btn-delete">
                          Xóa
                        </button>
                      </>
                    ) : (
                      <span>Chỉ được xem</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
