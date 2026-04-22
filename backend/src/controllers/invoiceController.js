import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import Medicine from "../models/Medicine.js";
import { logActivity } from "../utils/activityLogger.js";

let invoiceIndexSyncPromise = null;

const generateInvoiceCode = async () => {
  const invoices = await Invoice.find({
    invoiceId: { $regex: /^HD\d+$/ },
  })
    .select("invoiceId")
    .lean();

  const maxCode = invoices.reduce((max, invoice) => {
    const numericPart = Number(invoice.invoiceId.replace("HD", ""));
    return Number.isNaN(numericPart) ? max : Math.max(max, numericPart);
  }, 0);

  return `HD${String(maxCode + 1).padStart(3, "0")}`;
};

const syncInvoiceIndexes = async () => {
  if (!invoiceIndexSyncPromise) {
    invoiceIndexSyncPromise = Invoice.syncIndexes().catch((error) => {
      invoiceIndexSyncPromise = null;
      throw error;
    });
  }

  return invoiceIndexSyncPromise;
};

const saveInvoiceWithRecovery = async (invoicePayload) => {
  try {
    return await Invoice.create(invoicePayload);
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    console.error("Invoice insert hit duplicate index, syncing indexes and retrying...", error);
    await syncInvoiceIndexes();
    return Invoice.create(invoicePayload);
  }
};

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const getAllInvoice = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customerId", "customerId name phone")
      .populate("items.medicineId", "name unit");

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Lỗi khi gọi getAllInvoice", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "customerId name phone email address")
      .populate("items.medicineId", "name unit price");

    if (!invoice) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Lỗi khi gọi getInvoiceById", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const { customerId, items } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Vui lòng chọn khách hàng" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Hóa đơn phải có ít nhất 1 thuốc" });
    }

    const customer = isObjectId(customerId)
      ? await Customer.findById(customerId)
      : await Customer.findOne({ customerId });

    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tồn tại" });
    }

    const processedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!item.medicineId || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Số lượng thuốc không hợp lệ" });
      }

      if (!isObjectId(item.medicineId)) {
        return res.status(400).json({ message: "Thuốc không hợp lệ" });
      }

      const medicine = await Medicine.findById(item.medicineId);

      if (!medicine) {
        return res.status(404).json({ message: "Thuốc không tồn tại" });
      }

      if (medicine.stock < quantity) {
        return res.status(400).json({
          message: `Thuốc ${medicine.name} không đủ tồn kho (còn ${medicine.stock})`,
        });
      }

      processedItems.push({
        medicineId: medicine._id,
        quantity,
        price: Number(medicine.price),
        subtotal: quantity * Number(medicine.price),
        medicineName: medicine.name,
      });
    }

    const totalAmount = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const invoicePayload = {
      invoiceId: await generateInvoiceCode(),
      customerId: customer._id,
      items: processedItems.map(({ medicineName, ...item }) => item),
      totalAmount,
    };

    const newInvoice = await saveInvoiceWithRecovery(invoicePayload);

    await Promise.all(
      processedItems.map((item) =>
        Medicine.findByIdAndUpdate(item.medicineId, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    const populatedInvoice = await Invoice.findById(newInvoice._id)
      .populate("customerId", "customerId name phone email address")
      .populate("items.medicineId", "name unit price");

    await logActivity({
      req,
      action: "invoice.create",
      entityType: "invoice",
      entityId: newInvoice._id,
      entityName: newInvoice.invoiceId,
      details: `Đã tạo hóa đơn ${newInvoice.invoiceId} cho khách hàng ${customer.name}`,
      metadata: {
        invoiceId: newInvoice.invoiceId,
        customerName: customer.name,
        totalAmount,
        totalItems: processedItems.length,
      },
    });

    res.status(201).json(populatedInvoice);
  } catch (error) {
    console.error("Lỗi khi gọi createInvoice", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Không thể tạo hóa đơn do xung đột dữ liệu cũ trong database",
      });
    }

    res.status(500).json({ message: error.message || "Lỗi hệ thống" });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id).populate("customerId", "name");

    if (!invoice) {
      return res.status(404).json({ message: "Hóa đơn không tồn tại" });
    }

    await logActivity({
      req,
      action: "invoice.delete",
      entityType: "invoice",
      entityId: invoice._id,
      entityName: invoice.invoiceId,
      details: `Đã xóa hóa đơn ${invoice.invoiceId}`,
      metadata: {
        invoiceId: invoice.invoiceId,
        customerName: invoice.customerId?.name || "Không xác định",
        totalAmount: invoice.totalAmount,
      },
    });

    res.status(200).json({ message: "Hóa đơn đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi gọi deleteInvoice", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
