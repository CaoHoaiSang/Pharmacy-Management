import crypto from "crypto";

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const DEFAULT_SECRET = "pharmacy-management-dev-secret";

const encodeBase64Url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

const decodeBase64Url = (value) => {
  const decoded = Buffer.from(value, "base64url").toString("utf8");
  return JSON.parse(decoded);
};

const sign = (value) =>
  crypto
    .createHmac("sha256", process.env.JWT_SECRET || DEFAULT_SECRET)
    .update(value)
    .digest("base64url");

export const createAuthToken = (user) => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    sub: user._id.toString(),
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyAuthToken = (token) => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Token không hợp lệ");
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`);

  if (signature !== expectedSignature) {
    throw new Error("Token không hợp lệ");
  }

  const payload = decodeBase64Url(encodedPayload);

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token đã hết hạn");
  }

  return payload;
};
