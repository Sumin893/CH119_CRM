import crypto from "node:crypto";

const algorithm = "aes-256-gcm";

function getSecret(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value || Buffer.byteLength(value, "utf8") < 32) {
    throw new Error(`${name}는 32바이트 이상이어야 합니다.`);
  }

  return value;
}

function getEncryptionKey() {
  const secret = getSecret("ENCRYPTION_KEY");

  return crypto.createHash("sha256").update(secret).digest();
}

function getHashSecret() {
  return getSecret("PHONE_HASH_SECRET", process.env.ENCRYPTION_KEY);
}

export function encryptText(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(":");
}

export function decryptText(value: string) {
  const [ivText, tagText, encryptedText] = value.split(":");

  if (!ivText || !tagText || !encryptedText) {
    throw new Error("암호화된 개인정보 형식이 올바르지 않습니다.");
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(ivText, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(tagText, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function hashPhone(normalizedPhone: string) {
  return crypto.createHmac("sha256", getHashSecret()).update(normalizedPhone).digest("hex");
}

export function validateEncryptionConfig() {
  getEncryptionKey();
  getHashSecret();
}
