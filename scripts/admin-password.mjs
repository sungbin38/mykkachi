// Usage: node scripts/admin-password.mjs '<password>'
// Prints a PBKDF2-SHA256 hash to store as ADMIN_PASSWORD_HASH. The plain password is never stored.
import { webcrypto as crypto } from "node:crypto";
const password = process.argv[2];
if (!password) { console.error("Usage: node scripts/admin-password.mjs '<password>'"); process.exit(1); }
const iterations = 100_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
const b64 = (u8) => Buffer.from(u8).toString("base64");
console.log(`pbkdf2-sha256:${iterations}:${b64(salt)}:${b64(bits)}`);
