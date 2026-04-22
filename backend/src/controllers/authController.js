import User from "../models/User.js";
import { verifyPassword } from "../utils/password.js";
import { createAuthToken } from "../utils/token.js";

const normalizeUsername = (username = "") => username.trim().toLowerCase();

const serializeUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  fullName: user.fullName,
  role: user.role,
});

export const login = async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
    }

    const user = await User.findOne({ username, isActive: true });
    const hasPasswordCredentials = Boolean(user?.passwordSalt && user?.passwordHash);

    if (
      !user ||
      !hasPasswordCredentials ||
      !verifyPassword(password, user.passwordSalt, user.passwordHash)
    ) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const token = createAuthToken(user);

    return res.status(200).json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Lỗi khi gọi login", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: req.user });
};
