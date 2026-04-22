import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import customerRouter from "./routes/customerRoutes.js";
import invoiceRouter from "./routes/invoiceRoutes.js";
import medicineRouter from "./routes/medicineRoutes.js";
import supplierRouter from "./routes/supplierRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import { syncMedicineCategories } from "./utils/categoryUtils.js";
import { ensureDefaultUsers } from "./utils/seedDefaultUsers.js";
import dns from 'dns'
dns.setServers(['1.1.1.1','8.8.8.8'])

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/Pharmacy-Management/Auth", authRouter);
app.use("/Pharmacy-Management/Admin", adminRouter);
app.use("/Pharmacy-Management/Category", categoryRouter);
app.use("/Pharmacy-Management/Customer", customerRouter);
app.use("/Pharmacy-Management/Invoice", invoiceRouter);
app.use("/Pharmacy-Management/Medicine", medicineRouter);
app.use("/Pharmacy-Management/Supplier", supplierRouter);

connectDB()
  .then(async () => {
    await syncMedicineCategories();
    const createdUsers = await ensureDefaultUsers();

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại: http://localhost:${PORT}`);
      console.log("Cấu trúc API:");
      console.log(`- Đăng nhập: http://localhost:${PORT}/Pharmacy-Management/Auth/login`);
      console.log(`- Admin dashboard: http://localhost:${PORT}/Pharmacy-Management/Admin/dashboard`);
      console.log(`- Danh mục: http://localhost:${PORT}/Pharmacy-Management/Category`);
      console.log(`- Khách hàng: http://localhost:${PORT}/Pharmacy-Management/Customer`);
      console.log(`- Hóa đơn: http://localhost:${PORT}/Pharmacy-Management/Invoice`);
      console.log(`- Thuốc: http://localhost:${PORT}/Pharmacy-Management/Medicine`);
      console.log(`- Nhà cung cấp: http://localhost:${PORT}/Pharmacy-Management/Supplier`);

      if (createdUsers.length > 0) {
        console.log("Tài khoản mặc định vừa được tạo:");
        createdUsers.forEach((user) => {
          console.log(`- ${user.role}: ${user.username} / ${user.password}`);
        });
      }
    });
  })
  .catch((error) => {
    console.error("Lỗi kết nối Database:", error);
  });
