import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/Pharmacy-Management/Medicine';
const SUP_URL = 'http://localhost:5001/Pharmacy-Management/Supplier';

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({ name: '', category: '', unit: '', price: '', stock: '', expiryDate: '', supplierId: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `${API_URL}/${currentId}` : API_URL;
        
        await axios[method](url, formData);
        resetForm();
        fetchMedicines();
    };

    const resetForm = () => {
        setFormData({ name: '', category: '', unit: '', price: '', stock: '', expiryDate: '', supplierId: '' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const prepareEdit = (med) => {
        setFormData({
            name: med.name,
            category: med.category,
            unit: med.unit,
            price: med.price,
            stock: med.stock,
            expiryDate: med.expiryDate.split('T')[0],
            supplierId: med.supplierId?._id || med.supplierId
        });
        setIsEditing(true);
        setCurrentId(med._id);
        window.scrollTo(0, 0);
    };

    const handleImport = async (id, name) => {
        const qty = prompt(`Nhập số lượng nhập thêm cho: ${name}`);
        if (qty && !isNaN(qty) && parseInt(qty) > 0) {
            await axios.patch(`${API_URL}/${id}/import`, { quantity: parseInt(qty) });
            fetchMedicines();
        }
    };

    return (
        <div className="container">
            <h2>💊 Hệ thống Quản lý Thuốc</h2>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <h3>Thông tin thuốc</h3>
                    <div className="grid-form">
                        <input type="text" placeholder="Tên thuốc" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input type="text" placeholder="Loại thuốc" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                        <input type="text" placeholder="Đơn vị" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
                        <input type="number" placeholder="Giá bán" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                        <input type="number" placeholder="Tồn kho" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                        <input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
                        <select value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} required>
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <button type="submit" className="btn-save">{isEditing ? 'Cập nhật' : 'Lưu Thuốc'}</button>
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tên Thuốc</th>
                            <th>Loại</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Hạn SD</th>
                            <th>Nhà cung cấp</th>
                            <th>Thao tác</th>
                            <th>Kho</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map(med => (
                            <tr key={med._id}>
                                <td><strong>{med.name}</strong></td>
                                <td>{med.category}</td>
                                <td>{Number(med.price).toLocaleString()} VNĐ</td>
                                <td><span className="stock-badge">{med.stock}</span></td>
                                <td>{new Date(med.expiryDate).toLocaleDateString('vi-VN')}</td>
                                <td>{med.supplierId?.name || 'N/A'}</td>
                                <td>
                                    <button onClick={() => prepareEdit(med)} className="btn-edit">Sửa</button>
                                    <button onClick={() => axios.delete(`${API_URL}/${med._id}`).then(fetchMedicines)} className="btn-delete">Xóa</button>
                                </td>
                                <td>
                                    <button onClick={() => handleImport(med._id, med.name)} className="btn-import">+ Nhập hàng</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Medicines;