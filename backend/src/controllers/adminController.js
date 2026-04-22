import ActivityLog from "../models/ActivityLog.js";
import Invoice from "../models/Invoice.js";

const buildDayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const buildMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { start, end };
};

const extractRevenueTotal = (result) => result[0]?.totalRevenue || 0;

export const getAdminDashboard = async (req, res) => {
  try {
    const todayRange = buildDayRange();
    const monthRange = buildMonthRange();

    const [todayRevenueResult, monthRevenueResult, topMedicines, topCustomers, recentActivities] =
      await Promise.all([
        Invoice.aggregate([
          {
            $match: {
              invoiceDate: {
                $gte: todayRange.start,
                $lt: todayRange.end,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
            },
          },
        ]),
        Invoice.aggregate([
          {
            $match: {
              invoiceDate: {
                $gte: monthRange.start,
                $lt: monthRange.end,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
            },
          },
        ]),
        Invoice.aggregate([
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.medicineId",
              totalQuantity: { $sum: "$items.quantity" },
              totalRevenue: { $sum: "$items.subtotal" },
            },
          },
          { $sort: { totalQuantity: -1, totalRevenue: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "medicines",
              localField: "_id",
              foreignField: "_id",
              as: "medicine",
            },
          },
          {
            $unwind: {
              path: "$medicine",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 0,
              medicineId: "$_id",
              name: { $ifNull: ["$medicine.name", "Thuốc đã bị xóa"] },
              category: { $ifNull: ["$medicine.category", "Không xác định"] },
              totalQuantity: 1,
              totalRevenue: 1,
            },
          },
        ]),
        Invoice.aggregate([
          {
            $group: {
              _id: "$customerId",
              totalSpent: { $sum: "$totalAmount" },
              invoiceCount: { $sum: 1 },
            },
          },
          { $sort: { totalSpent: -1, invoiceCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "customers",
              localField: "_id",
              foreignField: "_id",
              as: "customer",
            },
          },
          {
            $unwind: {
              path: "$customer",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 0,
              customerId: "$_id",
              name: { $ifNull: ["$customer.name", "Khách hàng đã bị xóa"] },
              phone: { $ifNull: ["$customer.phone", "-"] },
              invoiceCount: 1,
              totalSpent: 1,
            },
          },
        ]),
        ActivityLog.find()
          .sort({ createdAt: -1 })
          .limit(12)
          .select("actorName actorRole action entityType entityId entityName details createdAt")
          .lean(),
      ]);

    return res.status(200).json({
      revenueToday: extractRevenueTotal(todayRevenueResult),
      revenueThisMonth: extractRevenueTotal(monthRevenueResult),
      topMedicines,
      topCustomers,
      recentActivities,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getAdminDashboard", error);
    return res.status(500).json({ message: "Không thể tải thống kê admin" });
  }
};
