import ActivityLog from "../models/ActivityLog.js";

const getActorName = (user) => user?.fullName || user?.username || "Người dùng không rõ";

export const logActivity = async ({
  req,
  action,
  entityType,
  entityId = "",
  entityName = "",
  details,
  metadata = {},
}) => {
  if (!req?.user || !details) {
    return;
  }

  try {
    await ActivityLog.create({
      actorId: req.user.id,
      actorName: getActorName(req.user),
      actorRole: req.user.role,
      action,
      entityType,
      entityId: entityId ? String(entityId) : "",
      entityName,
      details,
      metadata,
    });
  } catch (error) {
    console.error("Lỗi khi ghi activity log", error);
  }
};
