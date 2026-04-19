import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/Pharmacy-Management/Supplier';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    // Cập nhật formData thêm trường email
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
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
        // Reset email về trống
        setFormData({ name: '', phone: '', email: '', address: '' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const prepareEdit = (sup) => {
        // Gán giá trị email vào form khi sửa
        setFormData({ 
            name: sup.name, 
            phone: sup.phone, 
            email: sup.email || '', 
            address: sup.address || '' 
        });
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
                        {/* TRƯỜNG MỚI: Nhập Email */}
                        <input type="email" placeholder="Email liên hệ" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <input type="text" placeholder="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                        
                        <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" className="btn-save">{isEditing ? 'Cập nhật' : 'Lưu nhà cung cấp'}</button>
                            {isEditing && <button type="button" onClick={resetForm} className="btn-delete" style={{marginLeft: '10px'}}>Hủy</button>}
                        </div>
                    </div>
                </form>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Tên Công Ty</th>
                            <th>Điện thoại</th>
                            <th>Email</th> {/* CỘT MỚI: Email */}
                            <th>Địa chỉ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map(sup => (
                            <tr key={sup._id}>
                                <td><strong>{sup.name}</strong></td>
                                <td>{sup.phone}</td>
                                {/* HIỂN THỊ EMAIL */}
                                <td>{sup.email || <i style={{color: '#ccc'}}>Chưa cập nhật</i>}</td>
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