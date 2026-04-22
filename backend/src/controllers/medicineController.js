import Medicine from "../models/Medicine.js";
import { logActivity } from "../utils/activityLogger.js";
import { resolveCategoryFromPayload } from "../utils/categoryUtils.js";

export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .populate("supplierId", "name")
      .populate("categoryId", "name description");
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const category = await resolveCategoryFromPayload(req.body);
    const newMedicine = new Medicine({
      ...req.body,
      category: category.name,
      categoryId: category._id,
    });
    const savedMedicine = await newMedicine.save();
    const populatedMedicine = await Medicine.findById(savedMedicine._id)
      .populate("supplierId", "name")
      .populate("categoryId", "name description");

    await logActivity({
      req,
      action: "medicine.create",
      entityType: "medicine",
      entityId: savedMedicine._id,
      entityName: savedMedicine.name,
      details: `Đã thêm thuốc ${savedMedicine.name}`,
      metadata: {
        category: category.name,
        price: savedMedicine.price,
        stock: savedMedicine.stock,
      },
    });

    res.status(201).json(populatedMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const category = await resolveCategoryFromPayload(req.body);
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        category: category.name,
        categoryId: category._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("supplierId", "name")
      .populate("categoryId", "name description");

    if (!updatedMedicine) {
      return res.status(404).json({ message: "Không tìm thấy thuốc" });
    }

    await logActivity({
      req,
      action: "medicine.update",
      entityType: "medicine",
      entityId: updatedMedicine._id,
      entityName: updatedMedicine.name,
      details: `Đã cập nhật thuốc ${updatedMedicine.name}`,
      metadata: {
        category: category.name,
        price: updatedMedicine.price,
        stock: updatedMedicine.stock,
      },
    });

    res.status(200).json(updatedMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!deletedMedicine) {
      return res.status(404).json({ message: "Không tìm thấy thuốc" });
    }

    await logActivity({
      req,
      action: "medicine.delete",
      entityType: "medicine",
      entityId: deletedMedicine._id,
      entityName: deletedMedicine.name,
      details: `Đã xóa thuốc ${deletedMedicine.name}`,
      metadata: {
        category: deletedMedicine.category,
      },
    });

    res.status(200).json({ message: "Xóa thuốc thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const importStock = async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Số lượng nhập phải là số dương lớn hơn 0" });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: Math.trunc(quantity) } },
      { new: true }
    )
      .populate("supplierId", "name")
      .populate("categoryId", "name description");

    if (!updatedMedicine) {
      return res.status(404).json({ message: "Không tìm thấy thuốc để nhập hàng" });
    }

    await logActivity({
      req,
      action: "medicine.import",
      entityType: "medicine",
      entityId: updatedMedicine._id,
      entityName: updatedMedicine.name,
      details: `Đã nhập thêm ${Math.trunc(quantity)} ${updatedMedicine.unit} cho thuốc ${updatedMedicine.name}`,
      metadata: {
        quantity: Math.trunc(quantity),
        stockAfterImport: updatedMedicine.stock,
      },
    });

    res.status(200).json({
      message: "Nhập hàng thành công!",
      data: updatedMedicine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
