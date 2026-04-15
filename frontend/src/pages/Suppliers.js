import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/Pharmacy-Management/Supplier';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        const res = await axios.get(API_URL);
        setSuppliers(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await axios.put(`${API_URL}/${currentId}`, formData);
        } else {
            await axios.post(API_URL, formData);
        }
        resetForm();
        fetchSuppliers();
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', address: '' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const prepareEdit = (sup) => {
        setFormData({ name: sup.name, phone: sup.phone, address: sup.address || '' });
        setIsEditing(true);
        setCurrentId(sup._id);
        window.scrollTo(0, 0);
    };

    const deleteSupplier = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
            await axios.delete(`${API_URL}/${id}`);
            fetchSuppliers();
        }
    };

    return (
        <div className="container">
            <h2>🏢 Quản lý Nhà cung cấp</h2>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                <h3>Thông tin nhà cung cấp</h3>
                    <div className="grid-form">
                        <input type="text" placeholder="Tên nhà cung cấp" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input type="text" placeholder="Số điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                        <input type="text" placeholder="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        <button type="submit" className="btn-save">{isEditing ? 'Cập nhật' : 'Lưu nhà cung cấp'}</button>
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tên Công Ty</th>
                            <th>Điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(sup => (
                            <tr key={sup._id}>
                                <td>{sup.name}</td>
                                <td>{sup.phone}</td>
                                <td>{sup.address || 'N/A'}</td>
                                <td>
                                    <button onClick={() => prepareEdit(sup)} className="btn-edit">Sửa</button>
                                    <button onClick={() => deleteSupplier(sup._id)} className="btn-delete">Xóa</button>
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