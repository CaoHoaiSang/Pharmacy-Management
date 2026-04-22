import User from "../models/User.js";
import { verifyAuthToken } from "../utils/token.js";

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
};

export const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub).select("username fullName role isActive").lean();

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Tài khoản không hợp lệ hoặc đã bị khóa" });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || "Xác thực thất bại" });
  }
};

export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này" });
    }

    next();
  };
