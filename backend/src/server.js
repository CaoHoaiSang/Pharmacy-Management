import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Cần thêm để Frontend gọi API không bị chặn
import { connectDB } from './config/db.js';
import dns from 'dns';

// Cấu hình DNS để kết nối Database ổn định
dns.setServers(['1.1.1.1'], ['8.8.8.8']);


import customerRouter from './routes/customerRoutes.js';
import invoiceRouter from './routes/invoiceRoutes.js';
import medicineRouter from './routes/medicineRoutes.js';
import supplierRouter from './routes/supplierRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors()); // Cho phép Frontend truy cập API
app.use(express.json()); // Đọc dữ liệu JSON từ request body


app.use("/Pharmacy-Management/Customer", customerRouter);
app.use("/Pharmacy-Management/Invoice", invoiceRouter);
app.use("/Pharmacy-Management/Medicine", medicineRouter);
app.use("/Pharmacy-Management/Supplier", supplierRouter);

// Kết nối Database và khởi chạy Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        console.log("Cấu trúc API:");
        console.log(`- Khách hàng: http://localhost:${PORT}/Pharmacy-Management/Customer`);
        console.log(`- Hoá đơn: http://localhost:${PORT}/Pharmacy-Management/Invoice`);
        console.log(`- Thuốc: http://localhost:${PORT}/Pharmacy-Management/Medicine`);
        console.log(`- Nhà cung cấp: http://localhost:${PORT}/Pharmacy-Management/Supplier`);
    });
}).catch(err => {
    console.error("Lỗi kết nối Database:", err);
});