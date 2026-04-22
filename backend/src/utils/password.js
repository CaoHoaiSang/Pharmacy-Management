import crypto from "crypto";

const KEY_LENGTH = 64;

export const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const passwordHash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return {
    salt,
    passwordHash,
  };
};

export const verifyPassword = (password, salt, storedHash) => {
  const derivedHash = crypto.scryptSync(password, salt, KEY_LENGTH);
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (storedHashBuffer.length !== derivedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedHashBuffer, derivedHash);
};
