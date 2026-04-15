import Medicine from '../models/Medicine.js';

// Lấy danh sách tất cả các loại thuốc
export const getMedicines = async (req, res) => {
    try {
        // populate giúp lấy luôn tên nhà cung cấp thay vì chỉ hiện ID
        const medicines = await Medicine.find().populate('supplierId', 'name');
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm thuốc mới
export const createMedicine = async (req, res) => {
    try {
        const newMedicine = new Medicine(req.body);
        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật thông tin thuốc
export const updateMedicine = async (req, res) => {
    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Trả về dữ liệu mới sau khi sửa
        );
        if (!updatedMedicine) return res.status(404).json({ message: "Không tìm thấy thuốc" });
        res.status(200).json(updatedMedicine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa thuốc
export const deleteMedicine = async (req, res) => {
    try {
        const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!deletedMedicine) return res.status(404).json({ message: "Không tìm thấy thuốc" });
        res.status(200).json({ message: "Xóa thuốc thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Nhiệm vụ 2.5: NHẬP THÊM THUỐC VÀO KHO
export const importStock = async (req, res) => {
    try {
        const { quantity } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Số lượng nhập phải là số dương lớn hơn 0" });
        }

        // Tìm thuốc theo ID và tăng (increment) trường stock
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            { $inc: { stock: parseInt(quantity) } }, // Cộng thêm số lượng mới vào số cũ
            { new: true } // Trả về dữ liệu mới nhất sau khi cập nhật
        ).populate('supplierId', 'name');

        if (!updatedMedicine) {
            return res.status(404).json({ message: "Không tìm thấy thuốc để nhập hàng" });
        }

        res.status(200).json({
            message: "Nhập hàng thành công!",
            data: updatedMedicine
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};