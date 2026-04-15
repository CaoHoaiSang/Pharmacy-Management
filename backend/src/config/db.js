import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Đảm bảo load biến môi trường ngay lập tức
dotenv.config(); 

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("❌ Lỗi: MONGO_URI không tồn tại trong file .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log("✅ Kết nối MongoDB thành công!");
    } catch (error) {
        console.error("❌ Kết nối MongoDB thất bại:", error.message);
        process.exit(1);
    }
};