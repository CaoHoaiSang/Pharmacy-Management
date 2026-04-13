import Invoice from "../models/Invoice.js";

export const getAllInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.find().sort({createdAt: -1});
        res.status(200).json(invoice);
    } catch (error) {
        console.error("Lỗi khi gọi getAllInvoice", error);
        res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const createInvoice = async (req, res) => {
    try {
        const { invoiceId, customerId, items } = req.body;

        // Tự động tính subtotal và totalAmount
        const processedItems = items.map(item => ({
            ...item,
            subtotal: item.quantity * item.price
        }));

        const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

        const invoice = new Invoice({ invoiceId, customerId, items: processedItems, totalAmount });
        const newInvoice = await invoice.save();
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error("Lỗi khi gọi createInvoice", error);
        res.status(500).json({message: "Lỗi hệ thống"})
    }
}

export const deleteInvoice = async ( req, res) => {
    try {
        const deleteInvoice = await Invoice.findOneAndDelete({invoiceId: req.params.invoiceId});
        if(!deleteInvoice){
             return res.status(401).json({message: "Hóa đơn không tồn tại"})
        }
        res.status(201).json({message: "Bạn đã xóa thành công hóa đơn"})
    } catch (error) {
         console.error("Lỗi khi gọi deleteInvoice", error);
        res.status(500).json({message: "Lỗi hệ thống"})
    }
}