import Supplier from '../models/Supplier.js';

// Lấy toàn bộ danh sách nhà cung cấp
export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm nhà cung cấp mới
export const createSupplier = async (req, res) => {
    try {
        const newSupplier = new Supplier(req.body);
        await newSupplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật nhà cung cấp
export const updateSupplier = async (req, res) => {
    try {
        const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa nhà cung cấp
export const deleteSupplier = async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Xóa nhà cung cấp thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};