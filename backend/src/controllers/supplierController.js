import Supplier from "../models/Supplier.js";
import { logActivity } from "../utils/activityLogger.js";

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();

    await logActivity({
      req,
      action: "supplier.create",
      entityType: "supplier",
      entityId: newSupplier._id,
      entityName: newSupplier.name,
      details: `Đã thêm nhà cung cấp ${newSupplier.name}`,
      metadata: {
        phone: newSupplier.phone,
      },
    });

    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
    }

    await logActivity({
      req,
      action: "supplier.update",
      entityType: "supplier",
      entityId: updatedSupplier._id,
      entityName: updatedSupplier.name,
      details: `Đã cập nhật nhà cung cấp ${updatedSupplier.name}`,
      metadata: {
        phone: updatedSupplier.phone,
      },
    });

    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!deletedSupplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại" });
    }

    await logActivity({
      req,
      action: "supplier.delete",
      entityType: "supplier",
      entityId: deletedSupplier._id,
      entityName: deletedSupplier.name,
      details: `Đã xóa nhà cung cấp ${deletedSupplier.name}`,
      metadata: {
        phone: deletedSupplier.phone,
      },
    });

    res.status(200).json({ message: "Xóa nhà cung cấp thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
