import { z } from "zod";

// Zod Schemas
export const googleSignInSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const emailPasswordRegisterSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").optional(),
});

export const emailPasswordLoginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const sendEmailOtpSchema = z.object({
  email: z.email("Invalid email"),
});

export const verifyEmailOtpSchema = z.object({
  email: z.email("Invalid email"),
  otpId: z.uuid("Invalid OTP session"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const revokeSessionSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
