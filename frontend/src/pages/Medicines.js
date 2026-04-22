import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import { canManageMedicines } from "../utils/permissions";

const API_URL = "/Medicine";
const SUPPLIER_URL = "/Supplier";
const CATEGORY_URL = "/Category";
const PAGE_SIZE = 8;

const emptyForm = {
  name: "",
  categoryId: "",
  unit: "",
  price: "",
  stock: "",
  expiryDate: "",
  supplierId: "",
  description: "",
  image: "",
};

const normalizeCategory = (category) => category?.trim() || "Chưa phân loại";

const Medicines = () => {
  const { user } = useAuth();
  const canEdit = canManageMedicines(user);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [selectedMed, setSelectedMed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
    fetchCategories();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await api.get(API_URL);
      setMedicines(response.data);
    } catch (error) {
      setMessageType("error");
      setMessage("Không thể tải danh sách thuốc.");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get(SUPPLIER_URL);
      setSuppliers(response.data);
    } catch (error) {
      setMessageType("error");
      setMessage("Không thể tải nhà cung cấp.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get(CATEGORY_URL);
      setCategories(response.data);
    } catch (error) {
      setMessageType("error");
      setMessage("Không thể tải danh mục.");
    }
  };

  const categoryStats = useMemo(() => {
    const countsMap = medicines.reduce((map, medicine) => {
      const category = normalizeCategory(medicine.category);
      map.set(category, (map.get(category) || 0) + 1);
      return map;
    }, new Map());

    const stats = categories.map((category) => ({
      id: category._id,
      name: category.name,
      count: countsMap.get(category.name) || 0,
    }));

    countsMap.forEach((count, name) => {
      if (!stats.some((category) => category.name === name)) {
        stats.push({ id: name, name, count });
      }
    });

    return stats.sort((left, right) => left.name.localeCompare(right.name));
  }, [categories, medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      const expiryDate = new Date(medicine.expiryDate);
      const categoryName = normalizeCategory(medicine.category);

      const matchesSearch = `${medicine.name} ${categoryName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "all" || categoryName === activeCategory;
      let matchesStatus = true;

      if (filterStatus === "expired") {
        matchesStatus = expiryDate < now;
      } else if (filterStatus === "near-expiry") {
        matchesStatus = expiryDate >= now && expiryDate <= thirtyDaysFromNow;
      }

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [medicines, searchTerm, filterStatus, activeCategory]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredMedicines.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredMedicines, currentPage]);

  const groupedMedicines = useMemo(() => {
    const groups = paginatedMedicines.reduce((map, medicine) => {
      const category = normalizeCategory(medicine.category);

      if (!map.has(category)) {
        map.set(category, []);
      }

      map.get(category).push(medicine);
      return map;
    }, new Map());

    return Array.from(groups.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([name, items]) => ({ name, items }));
  }, [paginatedMedicines]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, activeCategory]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / PAGE_SIZE));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredMedicines.length, currentPage]);

  const resetForm = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleOpenModal = (medicine) => {
    setSelectedMed(medicine);
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    if (!formData.categoryId) {
      setMessageType("error");
      setMessage("Vui lòng chọn danh mục cho thuốc.");
      return;
    }

    const method = isEditing ? "put" : "post";
    const url = isEditing ? `${API_URL}/${currentId}` : API_URL;

    try {
      await api[method](url, formData);
      setMessageType("success");
      setMessage(isEditing ? "Cập nhật thuốc thành công." : "Thêm thuốc thành công.");
      resetForm();
      setCurrentPage(1);
      fetchMedicines();
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Không thể lưu thuốc.");
    }
  };

  const prepareEdit = (event, medicine) => {
    event.stopPropagation();

    if (!canEdit) {
      return;
    }

    const matchedCategory =
      categories.find((category) => category._id === (medicine.categoryId?._id || medicine.categoryId)) ||
      categories.find((category) => category.name === medicine.category);

    setFormData({
      name: medicine.name,
      categoryId: matchedCategory?._id || "",
      unit: medicine.unit,
      price: medicine.price,
      stock: medicine.stock,
      expiryDate: medicine.expiryDate.split("T")[0],
      supplierId: medicine.supplierId?._id || medicine.supplierId,
      description: medicine.description || "",
      image: medicine.image || "",
    });
    setIsEditing(true);
    setCurrentId(medicine._id);
    window.scrollTo(0, 0);
  };

  const handleImport = async (event, id, name) => {
    event.stopPropagation();

    if (!canEdit) {
      return;
    }

    const quantity = prompt(`Nhập số lượng nhập thêm cho: ${name}`);

    if (!quantity || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return;
    }

    try {
      await api.patch(`${API_URL}/${id}/import`, { quantity: Number(quantity) });
      setMessageType("success");
      setMessage("Nhập hàng thành công.");
      fetchMedicines();
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Không thể nhập hàng.");
    }
  };

  const handleDelete = async (event, id) => {
    event.stopPropagation();

    if (!canEdit || !window.confirm("Bạn có chắc muốn xóa thuốc này?")) {
      return;
    }

    try {
      await api.delete(`${API_URL}/${id}`);
      setMessageType("success");
      setMessage("Xóa thuốc thành công.");
      fetchMedicines();
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Không thể xóa thuốc.");
    }
  };

  const renderMedicineRow = (medicine) => {
    const isExpired = new Date(medicine.expiryDate) < new Date();
    const isNearExpiry =
      new Date(medicine.expiryDate) <= new Date(new Date().setDate(new Date().getDate() + 30)) && !isExpired;

    return (
      <tr
        key={medicine._id}
        className={isExpired ? "row-expired" : isNearExpiry ? "row-warning" : ""}
        onClick={() => handleOpenModal(medicine)}
        style={{ cursor: "pointer" }}
      >
        <td>
          <img src={medicine.image || "https://via.placeholder.com/50"} alt="thumb" className="img-mini" />
        </td>
        <td>
          <strong>{medicine.name}</strong>
        </td>
        <td>
          <span className="medicine-category-pill">{normalizeCategory(medicine.category)}</span>
        </td>
        <td>
          <strong>{Number(medicine.price).toLocaleString("vi-VN")} đ</strong> / {medicine.unit}
        </td>
        <td>
          <span className="stock-badge">
            {medicine.stock} {medicine.unit}
          </span>
        </td>
        <td>{new Date(medicine.expiryDate).toLocaleDateString("vi-VN")}</td>
        <td>
          {isExpired ? (
            <span className="status-tag tag-red">Hết hạn</span>
          ) : isNearExpiry ? (
            <span className="status-tag tag-yellow">Sắp hết hạn</span>
          ) : (
            <span className="status-tag tag-green">Tốt</span>
          )}
        </td>
        <td>
          {canEdit ? (
            <>
              <button onClick={(event) => prepareEdit(event, medicine)} className="btn-edit">
                Sửa
              </button>
              <button onClick={(event) => handleImport(event, medicine._id, medicine.name)} className="btn-import">
                + Nhập
              </button>
              <button onClick={(event) => handleDelete(event, medicine._id)} className="btn-delete">
                Xóa
              </button>
            </>
          ) : (
            <span>Chi tiết</span>
          )}
        </td>
      </tr>
    );
  };

  const renderMedicineCard = (medicine) => (
    <div className="med-card" key={medicine._id} onClick={() => handleOpenModal(medicine)} style={{ cursor: "pointer" }}>
      <div className="card-image">
        <img src={medicine.image || "https://via.placeholder.com/150"} alt={medicine.name} />
        <span
          className={`card-tag ${
            new Date(medicine.expiryDate) < new Date()
              ? "tag-red"
              : new Date(medicine.expiryDate) <= new Date(new Date().setDate(new Date().getDate() + 30))
                ? "tag-yellow"
                : ""
          }`}
        >
          {normalizeCategory(medicine.category)}
        </span>
      </div>
      <div className="card-content">
        <h4>{medicine.name}</h4>
        <p className="card-desc">{medicine.description || "Không có mô tả chi tiết."}</p>
        <div className="card-price">
          {Number(medicine.price).toLocaleString("vi-VN")} đ <small>/{medicine.unit}</small>
        </div>
        <div className="card-footer">
          <span>
            Kho: <strong>{medicine.stock}</strong> {medicine.unit}
          </span>
          {canEdit && (
            <div className="card-btns">
              <button onClick={(event) => prepareEdit(event, medicine)} className="btn-edit">
                Sửa
              </button>
              <button onClick={(event) => handleImport(event, medicine._id, medicine.name)} className="btn-import">
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="header-section">
        <h2>Hệ thống quản lý thuốc</h2>
        <p>Thêm, cập nhật, lọc và xem chi tiết thông tin thuốc trong kho theo từng danh mục.</p>
      </div>

      {message && (
        <div className={`alert ${messageType === "error" ? "alert-error" : "alert-success"}`}>
          {message}
        </div>
      )}

      {canEdit ? (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="section-header-inline">
              <h3>{isEditing ? "Cập nhật thuốc" : "Thêm thuốc mới"}</h3>
              <Link to="/categories" className="section-manage-link">
                Quản lý danh mục
              </Link>
            </div>

            {categories.length === 0 && (
              <div className="alert alert-error" style={{ marginBottom: "18px" }}>
                Chưa có danh mục nào. Hãy tạo danh mục trước khi thêm thuốc.
              </div>
            )}

            <div className="grid-form">
              <input
                type="text"
                placeholder="Tên thuốc"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                required
              />
              <select
                value={formData.categoryId}
                onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Đơn vị"
                value={formData.unit}
                onChange={(event) => setFormData({ ...formData, unit: event.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Giá bán"
                value={formData.price}
                onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Tồn kho"
                value={formData.stock}
                onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                required
              />
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(event) => setFormData({ ...formData, expiryDate: event.target.value })}
                required
              />
              <select
                value={formData.supplierId}
                onChange={(event) => setFormData({ ...formData, supplierId: event.target.value })}
                required
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Link ảnh thuốc"
                value={formData.image}
                onChange={(event) => setFormData({ ...formData, image: event.target.value })}
              />

              <textarea
                className="full-width"
                placeholder="Mô tả chi tiết thuốc..."
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              />

              <div className="form-actions full-width">
                <button type="submit" className="btn-save" disabled={categories.length === 0}>
                  {isEditing ? "Cập nhật" : "Lưu thuốc"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="btn-delete" style={{ marginLeft: "10px" }}>
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="alert alert-success">Tài khoản này chỉ được xem danh sách thuốc.</div>
      )}

      <div className="category-overview">
        <button
          type="button"
          className={`category-chip ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          Tất cả
          <span>{medicines.length}</span>
        </button>
        {categoryStats.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`category-chip ${activeCategory === category.name ? "active" : ""}`}
            onClick={() => setActiveCategory(category.name)}
          >
            {category.name}
            <span>{category.count}</span>
          </button>
        ))}
      </div>

      <div className="filter-bar medicine-filter-bar">
        <div className="medicine-filter-controls">
          <input
            type="text"
            placeholder="Tìm kiếm tên thuốc hoặc danh mục..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="search-input"
          />
          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="all">Tất cả hạn sử dụng</option>
            <option value="near-expiry">Sắp hết hạn</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>

        <div className="view-switcher">
          <button className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>
            Dạng bảng
          </button>
          <button className={viewMode === "card" ? "active" : ""} onClick={() => setViewMode("card")}>
            Dạng thẻ
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên thuốc</th>
                <th>Danh mục</th>
                <th>Giá/Đơn vị</th>
                <th>Tồn kho</th>
                <th>Hạn SD</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {groupedMedicines.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Không có thuốc phù hợp với bộ lọc hiện tại
                  </td>
                </tr>
              ) : (
                groupedMedicines.map((group) => (
                  <React.Fragment key={group.name}>
                    <tr className="category-section-row">
                      <td colSpan="8">
                        <div className="category-section-header">
                          <strong>{group.name}</strong>
                          <span>{group.items.length} thuốc</span>
                        </div>
                      </td>
                    </tr>
                    {group.items.map((medicine) => renderMedicineRow(medicine))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : groupedMedicines.length === 0 ? (
        <div className="table-container empty-category-state">
          <p>Không có thuốc phù hợp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <div className="category-card-layout">
          {groupedMedicines.map((group) => (
            <section key={group.name} className="category-card-section">
              <div className="category-section-title">
                <h3>{group.name}</h3>
                <span>{group.items.length} thuốc</span>
              </div>
              <div className="card-grid">
                {group.items.map((medicine) => renderMedicineCard(medicine))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={filteredMedicines.length}
        onPageChange={setCurrentPage}
        itemLabel="thuốc"
      />

      {showModal && selectedMed && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <div className="modal-body-detail">
              <div className="modal-img-container">
                <img src={selectedMed.image || "https://via.placeholder.com/200"} alt={selectedMed.name} />
              </div>
              <div className="modal-info-detail">
                <h2>{selectedMed.name}</h2>
                <p className="modal-cat">
                  Loại: <strong>{normalizeCategory(selectedMed.category)}</strong>
                </p>
                <hr />
                <div className="detail-grid">
                  <p>
                    Giá: <strong>{Number(selectedMed.price).toLocaleString("vi-VN")} đ</strong>
                  </p>
                  <p>
                    Tồn kho:{" "}
                    <strong>
                      {selectedMed.stock} {selectedMed.unit}
                    </strong>
                  </p>
                  <p>
                    Hạn SD: <strong>{new Date(selectedMed.expiryDate).toLocaleDateString("vi-VN")}</strong>
                  </p>
                  <p>
                    Nhà cung cấp:{" "}
                    <strong>
                      {suppliers.find((supplier) => supplier._id === (selectedMed.supplierId?._id || selectedMed.supplierId))
                        ?.name || "Không có"}
                    </strong>
                  </p>
                </div>
                <hr />
                <p className="modal-desc-full">
                  <strong>Mô tả:</strong>
                  <br />
                  {selectedMed.description || "Không có mô tả chi tiết."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
