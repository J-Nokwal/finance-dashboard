import crypto from "crypto";


function generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
}
function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0"); // 6 digits
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export default {
    generateRandomToken,
    generateOtp,
    hashOtp,
} 