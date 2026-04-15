import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true }, // VD: Hộp, Vỉ, Lọ
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }, // Tồn kho mặc định là 0
    expiryDate: { type: Date, required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    description: { type: String }
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);