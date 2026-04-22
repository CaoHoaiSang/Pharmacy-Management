import User from "../models/User.js";
import { hashPassword, verifyPassword } from "./password.js";

const defaultUsers = [
  {
    username: "admin",
    fullName: "Quản trị viên",
    password: "admin123",
    role: "admin",
  },
  {
    username: "staff",
    fullName: "Nhân viên bán thuốc",
    password: "staff123",
    role: "staff",
  },
  {
    username: "warehouse",
    fullName: "Quản lý kho",
    password: "warehouse123",
    role: "warehouse",
  },
];

export const ensureDefaultUsers = async () => {
  const createdUsers = [];

  for (const defaultUser of defaultUsers) {
    const existingUser = await User.findOne({ username: defaultUser.username });

    if (existingUser) {
      const hasValidPassword =
        Boolean(existingUser.passwordSalt && existingUser.passwordHash) &&
        verifyPassword(defaultUser.password, existingUser.passwordSalt, existingUser.passwordHash);

      const needsUpdate =
        existingUser.fullName !== defaultUser.fullName ||
        existingUser.role !== defaultUser.role ||
        existingUser.isActive !== true ||
        !hasValidPassword;

      if (needsUpdate) {
        existingUser.fullName = defaultUser.fullName;
        existingUser.role = defaultUser.role;
        existingUser.isActive = true;

        if (!hasValidPassword) {
          const { salt, passwordHash } = hashPassword(defaultUser.password);
          existingUser.passwordSalt = salt;
          existingUser.passwordHash = passwordHash;
        }

        await existingUser.save();
      }

      continue;
    }

    const { salt, passwordHash } = hashPassword(defaultUser.password);

    await User.create({
      username: defaultUser.username,
      fullName: defaultUser.fullName,
      passwordHash,
      passwordSalt: salt,
      role: defaultUser.role,
      isActive: true,
    });

    createdUsers.push({
      username: defaultUser.username,
      password: defaultUser.password,
      role: defaultUser.role,
    });
  }

  return createdUsers;
};
