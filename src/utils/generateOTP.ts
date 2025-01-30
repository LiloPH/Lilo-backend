import crypto from "crypto";

export default function generateOTP() {
  const buffer = crypto.randomBytes(3);
  const number = buffer.readUIntBE(0, 3);
  return (number % 1000).toString().padStart(6, "0");
}
