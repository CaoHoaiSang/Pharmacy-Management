import Category from "../models/Category.js";
import Medicine from "../models/Medicine.js";
import { logActivity } from "../utils/activityLogger.js";
import { ensureCategoryByName, normalizeCategoryName } from "../utils/categoryUtils.js";

export const getCategories = async (req, res) => {
  try {
    const [categories, medicineCounts] = await Promise.all([
      Category.find({ isActive: true }).sort({ name: 1 }).lean(),
      Medicine.aggregate([
        {
          $match: {
            categoryId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            medicineCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const countMap = new Map(medicineCounts.map((item) => [String(item._id), item.medicineCount]));

    const payload = categories.map((category) => ({
      ...category,
      medicineCount: countMap.get(String(category._id)) || 0,
    }));

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Lỗi khi gọi getCategories", error);
    return res.status(500).json({ message: "Không thể tải danh mục" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const name = normalizeCategoryName(req.body.name);

    if (!name) {
      return res.status(400).json({ message: "Tên danh mục không được để trống" });
    }

    const existingCategory = await Category.findOne({ normalizedName: name.toLowerCase() });

    if (existingCategory) {
      return res.status(409).json({ message: "Danh mục này đã tồn tại" });
    }

    const category = await ensureCategoryByName(name, req.body.description || "");

    await logActivity({
      req,
      action: "category.create",
      entityType: "category",
      entityId: category._id,
      entityName: category.name,
      details: `Đã thêm danh mục ${category.name}`,
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error("Lỗi khi gọi createCategory", error);

    if (error?.code === 11000) {
      return res.status(409).json({ message: "Danh mục này đã tồn tại" });
    }

    return res.status(400).json({ message: error.message || "Không thể tạo danh mục" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const previousName = category.name;
    const nextName = normalizeCategoryName(req.body.name);

    if (!nextName) {
      return res.status(400).json({ message: "Tên danh mục không được để trống" });
    }

    const duplicate = await Category.findOne({
      _id: { $ne: category._id },
      normalizedName: nextName.toLowerCase(),
    });

    if (duplicate) {
      return res.status(409).json({ message: "Danh mục này đã tồn tại" });
    }

    category.name = nextName;
    category.description = req.body.description || "";
    await category.save();

    await Medicine.updateMany(
      {
        $or: [{ categoryId: category._id }, { category: previousName }],
      },
      {
        $set: {
          categoryId: category._id,
          category: category.name,
        },
      }
    );

    await logActivity({
      req,
      action: "category.update",
      entityType: "category",
      entityId: category._id,
      entityName: category.name,
      details: `Đã cập nhật danh mục ${previousName} thành ${category.name}`,
    });

    return res.status(200).json(category);
  } catch (error) {
    console.error("Lỗi khi gọi updateCategory", error);
    return res.status(400).json({ message: error.message || "Không thể cập nhật danh mục" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const medicineCount = await Medicine.countDocuments({
      $or: [{ categoryId: category._id }, { category: category.name }],
    });

    if (medicineCount > 0) {
      return res.status(400).json({
        message: "Không thể xóa danh mục đang được sử dụng trong danh sách thuốc",
      });
    }

    await Category.findByIdAndDelete(category._id);

    await logActivity({
      req,
      action: "category.delete",
      entityType: "category",
      entityId: category._id,
      entityName: category.name,
      details: `Đã xóa danh mục ${category.name}`,
    });

    return res.status(200).json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Lỗi khi gọi deleteCategory", error);
    return res.status(500).json({ message: "Không thể xóa danh mục" });
  }
};
