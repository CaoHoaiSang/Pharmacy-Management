import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/Pharmacy-Management/Medicine';
const SUP_URL = 'http://localhost:5001/Pharmacy-Management/Supplier';

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [viewMode, setViewMode] = useState('table');
    
    // --- CHỨC NĂNG MỚI: State cho Modal chi tiết ---
    const [selectedMed, setSelectedMed] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({ 
        name: '', category: '', unit: '', price: '', stock: '', 
        expiryDate: '', supplierId: '', description: '', image: '' 
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [filterStatus, setFilterStatus] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMedicines();
        fetchSuppliers();
    }, []);

    const fetchMedicines = async () => {
        const res = await axios.get(API_URL);
        setMedicines(res.data);
    };

    const fetchSuppliers = async () => {
        const res = await axios.get(SUP_URL);
        setSuppliers(res.data);
    };

    const filteredMedicines = medicines.filter(med => {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        const expiryDate = new Date(med.expiryDate);

        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesStatus = true;
        if (filterStatus === 'expired') {
            matchesStatus = expiryDate < now;
        } else if (filterStatus === 'near-expiry') {
            matchesStatus = expiryDate >= now && expiryDate <= thirtyDaysFromNow;
        }
        return matchesSearch && matchesStatus;
    });

    // --- CHỨC NĂNG MỚI: Hàm mở Modal ---
    const handleOpenModal = (med) => {
        setSelectedMed(med);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `${API_URL}/${currentId}` : API_URL;
        await axios[method](url, formData);
        resetForm();
        fetchMedicines();
    };

    const resetForm = () => {
        setFormData({ name: '', category: '', unit: '', price: '', stock: '', expiryDate: '', supplierId: '', description: '', image: '' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const prepareEdit = (e, med) => {
        e.stopPropagation(); // Ngăn việc mở popup khi bấm nút sửa
        setFormData({
            name: med.name,
            category: med.category,
            unit: med.unit,
            price: med.price,
            stock: med.stock,
            expiryDate: med.expiryDate.split('T')[0],
            supplierId: med.supplierId?._id || med.supplierId,
            description: med.description || '',
            image: med.image || ''
        });
        setIsEditing(true);
        setCurrentId(med._id);
        window.scrollTo(0, 0);
    };

    const handleImport = (e, id, name) => {
        e.stopPropagation(); // Ngăn việc mở popup khi bấm nút nhập
        const qty = prompt(`Nhập số lượng nhập thêm cho: ${name}`);
        if (qty && !isNaN(qty) && parseInt(qty) > 0) {
            axios.patch(`${API_URL}/${id}/import`, { quantity: parseInt(qty) })
                 .then(() => fetchMedicines());
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation(); // Ngăn việc mở popup khi bấm nút xóa
        if(window.confirm("Bạn có chắc muốn xóa thuốc này?")) {
            axios.delete(`${API_URL}/${id}`).then(() => fetchMedicines());
        }
    };

    return (
        <div className="container">
            <h2>💊 Hệ thống Quản lý Thuốc</h2>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h3>{isEditing ? 'Cập nhật thuốc' : 'Thêm thuốc mới'}</h3>
                    <div className="grid-form">
                        <input type="text" placeholder="Tên thuốc" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input type="text" placeholder="Loại thuốc" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                        <input type="text" placeholder="Đơn vị (Viên, Chai, Vỉ...)" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
                        <input type="number" placeholder="Giá bán" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        <input type="number" placeholder="Tồn kho" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                        <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
                        <select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} required>
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <input type="text" placeholder="Link ảnh thuốc (URL)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                        
                        <textarea 
                            className="full-width"
                            placeholder="Mô tả chi tiết thuốc..." 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                        
                        <div className="form-actions full-width">
                            <button type="submit" className="btn-save">{isEditing ? 'Cập nhật' : 'Lưu Thuốc'}</button>
                            {isEditing && <button type="button" onClick={resetForm} className="btn-delete" style={{marginLeft: '10px'}}>Hủy</button>}
                        </div>
                    </div>
                </form>
            </div>

            <div className="filter-bar" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', gap: '15px'}}>
                    <input 
                        type="text" 
                        placeholder="🔍 Tìm kiếm tên thuốc..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tất cả hạn sử dụng</option>
                        <option value="near-expiry">⚠️ Sắp hết hạn</option>
                        <option value="expired">❌ Đã hết hạn</option>
                    </select>
                </div>

                <div className="view-switcher">
                    <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>📄 Dạng Bảng</button>
                    <button className={viewMode === 'card' ? 'active' : ''} onClick={() => setViewMode('card')}>🎴 Dạng Thẻ</button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Tên Thuốc</th>
                                <th>Giá/Đơn vị</th>
                                <th>Tồn kho</th>
                                <th>Hạn SD</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map(med => {
                                const isExpired = new Date(med.expiryDate) < new Date();
                                const isNearExpiry = new Date(med.expiryDate) <= new Date(new Date().setDate(new Date().getDate() + 30)) && !isExpired;

                                return (
                                    <tr key={med._id} 
                                        className={isExpired ? 'row-expired' : isNearExpiry ? 'row-warning' : ''}
                                        onClick={() => handleOpenModal(med)} 
                                        style={{cursor: 'pointer'}}
                                    >
                                        <td>
                                            <img src={med.image || 'https://via.placeholder.com/50'} alt="thumb" className="img-mini" />
                                        </td>
                                        <td><strong>{med.name}</strong><br/><small>{med.category}</small></td>
                                        <td><strong>{Number(med.price).toLocaleString()}đ</strong> / {med.unit}</td>
                                        <td><span className="stock-badge">{med.stock} {med.unit}</span></td>
                                        <td>{new Date(med.expiryDate).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            {isExpired ? <span className="status-tag tag-red">Hết hạn</span> : 
                                             isNearExpiry ? <span className="status-tag tag-yellow">Sắp hết hạn</span> : 
                                             <span className="status-tag tag-green">Tốt</span>}
                                        </td>
                                        <td>
                                            <button onClick={(e) => prepareEdit(e, med)} className="btn-edit">Sửa</button>
                                            <button onClick={(e) => handleImport(e, med._id, med.name)} className="btn-import">+ Nhập</button>
                                            <button onClick={(e) => handleDelete(e, med._id)} className="btn-delete">Xóa</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card-grid">
                    {filteredMedicines.map(med => (
                        <div className="med-card" key={med._id} onClick={() => handleOpenModal(med)} style={{cursor: 'pointer'}}>
                            <div className="card-image">
                                <img src={med.image || 'https://via.placeholder.com/150'} alt={med.name} />
                                <span className={`card-tag ${new Date(med.expiryDate) < new Date() ? 'tag-red' : ''}`}>
                                    {med.category}
                                </span>
                            </div>
                            <div className="card-content">
                                <h4>{med.name}</h4>
                                <p className="card-desc">{med.description || 'Không có mô tả chi tiết.'}</p>
                                <div className="card-price">
                                    {Number(med.price).toLocaleString()}đ <small>/{med.unit}</small>
                                </div>
                                <div className="card-footer">
                                    <span>Kho: <strong>{med.stock}</strong> {med.unit}</span>
                                    <div className="card-btns">
                                        <button onClick={(e) => prepareEdit(e, med)} className="btn-edit">Sửa</button>
                                        <button onClick={(e) => handleImport(e, med._id, med.name)} className="btn-import">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- CHỨC NĂNG MỚI: UI POPUP MODAL --- */}
            {showModal && selectedMed && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        <div className="modal-body-detail">
                            <div className="modal-img-container">
                                <img src={selectedMed.image || 'https://via.placeholder.com/200'} alt={selectedMed.name} />
                            </div>
                            <div className="modal-info-detail">
                                <h2>{selectedMed.name}</h2>
                                <p className="modal-cat">Loại: <strong>{selectedMed.category}</strong></p>
                                <hr/>
                                <div className="detail-grid">
                                    <p>💰 Giá: <strong>{Number(selectedMed.price).toLocaleString()}đ</strong></p>
                                    <p>📦 Tồn kho: <strong>{selectedMed.stock} {selectedMed.unit}</strong></p>
                                    <p>📅 Hạn SD: <strong>{new Date(selectedMed.expiryDate).toLocaleDateString('vi-VN')}</strong></p>
                                    <p>🏢 Nhà cung cấp: <strong>{suppliers.find(s => s._id === (selectedMed.supplierId?._id || selectedMed.supplierId))?.name || 'N/A'}</strong></p>
                                </div>
                                <hr/>
                                <p className="modal-desc-full"><strong>Mô tả:</strong><br/>{selectedMed.description || 'Không có mô tả chi tiết.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicines;