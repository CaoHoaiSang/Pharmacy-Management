import Category from "../models/Category.js";
import Medicine from "../models/Medicine.js";

export const normalizeCategoryName = (value = "") => value.trim().replace(/\s+/g, " ");

const getNormalizedLookup = (name) => normalizeCategoryName(name).toLowerCase();

export const ensureCategoryByName = async (name, description = "") => {
  const normalizedName = normalizeCategoryName(name);

  if (!normalizedName) {
    return null;
  }

  const lookup = getNormalizedLookup(normalizedName);
  let category = await Category.findOne({ normalizedName: lookup });

  if (category) {
    return category;
  }

  category = await Category.create({
    name: normalizedName,
    normalizedName: lookup,
    description,
  });

  return category;
};

export const resolveCategoryFromPayload = async ({ categoryId, category }) => {
  if (categoryId) {
    const categoryDoc = await Category.findById(categoryId);

    if (!categoryDoc) {
      throw new Error("Danh mục không tồn tại");
    }

    return categoryDoc;
  }

  const categoryName = normalizeCategoryName(category);

  if (!categoryName) {
    throw new Error("Vui lòng chọn danh mục");
  }

  return ensureCategoryByName(categoryName);
};

export const syncMedicineCategories = async () => {
  const medicines = await Medicine.find({}, "_id category categoryId").lean();

  if (medicines.length === 0) {
    return;
  }

  const categoryCache = new Map();
  const updates = [];

  for (const medicine of medicines) {
    const categoryName = normalizeCategoryName(medicine.category);

    if (!categoryName) {
      continue;
    }

    const lookup = getNormalizedLookup(categoryName);
    let categoryDoc = categoryCache.get(lookup);

    if (!categoryDoc) {
      categoryDoc = await ensureCategoryByName(categoryName);
      categoryCache.set(lookup, categoryDoc);
    }

    const hasSameCategoryId =
      medicine.categoryId && String(medicine.categoryId) === String(categoryDoc._id);
    const hasSameCategoryName = medicine.category === categoryDoc.name;

    if (hasSameCategoryId && hasSameCategoryName) {
      continue;
    }

    updates.push({
      updateOne: {
        filter: { _id: medicine._id },
        update: {
          $set: {
            category: categoryDoc.name,
            categoryId: categoryDoc._id,
          },
        },
      },
    });
  }

  if (updates.length > 0) {
    await Medicine.bulkWrite(updates);
  }
};
