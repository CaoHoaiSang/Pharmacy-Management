import Invoice from "../models/Invoice.js";
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";

// Xem danh sách hóa đơn
export const getAllInvoice = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        console.error("Lỗi khi gọi getAllInvoice", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

// Xem chi tiết 1 hóa đơn
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ invoiceId: req.params.invoiceId });
        if (!invoice) {
            return res.status(404).json({ message: "Hóa đơn không tồn tại" });
        }
        res.status(200).json(invoice);
    } catch (error) {
        console.error("Lỗi khi gọi getInvoiceById", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

// Tạo hóa đơn
export const createInvoice = async (req, res) => {
    try {
        const { invoiceId, customerId, items } = req.body;

        // Kiểm tra khách hàng tồn tại không
        const customer = await Customer.findOne({ customerId });
        if (!customer) {
            return res.status(404).json({ message: "Khách hàng không tồn tại" });
        }

        // Kiểm tra từng thuốc và tồn kho
        const processedItems = [];
        for (const item of items) {
            const medicine = await Medicine.findOne({ medicineId: item.medicineId });
            if (!medicine) {
                return res.status(404).json({ message: `Thuốc ${item.medicineId} không tồn tại` });
            }
            if (medicine.stock < item.quantity) {
                return res.status(400).json({ message: `Thuốc ${medicine.name} không đủ tồn kho (còn ${medicine.stock})` });
            }
            processedItems.push({
                medicineId: item.medicineId,
                quantity: item.quantity,
                price: medicine.price, // lấy giá từ DB, không để client tự truyền
                subtotal: item.quantity * medicine.price
            });
        }

        // Tính tổng tiền
        const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

        // Lưu hóa đơn
        const invoice = new Invoice({ invoiceId, customerId, items: processedItems, totalAmount });
        const newInvoice = await invoice.save();

        // Giảm tồn kho sau khi bán
        for (const item of processedItems) {
            await Medicine.findOneAndUpdate(
                { medicineId: item.medicineId },
                { $inc: { stock: -item.quantity } } // $inc giảm đúng số lượng đã bán
            );
        }

        res.status(201).json(newInvoice);
    } catch (error) {
        console.error("Lỗi khi gọi createInvoice", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

// Xóa hóa đơn
export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({ invoiceId: req.params.invoiceId });
        if (!invoice) {
            return res.status(404).json({ message: "Hóa đơn không tồn tại" });
        }
        res.status(200).json({ message: "Hóa đơn đã được xóa thành công" });
    } catch (error) {
        console.error("Lỗi khi gọi deleteInvoice", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
}
