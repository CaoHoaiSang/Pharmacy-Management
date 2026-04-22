
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const normalizeEnvValue = (value = "") => value.trim().replace(/^['"]|['"]$/g, "");

export const connectDB = async () => {
  const uri = normalizeEnvValue(process.env.MONGO_URI || "");

  if (!uri) {
    console.error("Lỗi: MONGO_URI không tồn tại trong file .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log("Kết nối MongoDB thành công!");
  } catch (error) {
    console.error("Kết nối MongoDB thất bại:", error.message);
    process.exit(1);
  }
};

