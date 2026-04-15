import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String }
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);