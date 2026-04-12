import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("Bạn đã kết nối thành công CSDL");
    } catch (error) {
        console.error("Bạn kết nối thất bại", error);
        process.exit(1);
    }
}