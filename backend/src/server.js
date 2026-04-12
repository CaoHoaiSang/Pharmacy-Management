import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import dns from 'dns';
dns.setServers(['1.1.1.1'],['8.8.8.8'])

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5001;

// Kết nối database thành công trước rồi server mới chạy
connectDB().then(() => {
    // Lắng nghe kết nối trên cổng 5001
    // Các cổng phổ biến là : 8000, 8080, 5000, 5001, 5173, 3000
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
