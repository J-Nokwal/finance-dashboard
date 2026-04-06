import {
  loginWithGoogle,
  loginWithEmailPassword,
  loginWithEmailOtp,
  sendLoginOtp,
  logout,
  refreshSession,
  registerWithEmailPassword,
} from "./auth.services";
import {
  googleSignInSchema,
  emailPasswordRegisterSchema,
  emailPasswordLoginSchema,
  sendEmailOtpSchema,
  verifyEmailOtpSchema,
  refreshTokenSchema,
} from "./auth.validations";
import { Request, Response } from "express";
import { z } from "zod";

// Helpers
function getAuthContext(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

// Controllers
export const googleSignIn = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = googleSignInSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const session = await loginWithGoogle(
    result.data.idToken,
    getAuthContext(req),
  );
  res.status(200).json(session);
};

export const emailPasswordRegister = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = emailPasswordRegisterSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  await registerWithEmailPassword(result.data.email, result.data.password);
  res.status(201).json({ message: "Account created successfully" });
};

export const emailPasswordLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = emailPasswordLoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const session = await loginWithEmailPassword(
    result.data.email,
    result.data.password,
    getAuthContext(req),
  );
  res.status(200).json(session);
};

export const sendEmailOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = sendEmailOtpSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const response = await sendLoginOtp(result.data.email);
  res.status(200).json(response); // { otpId }
};

export const verifyEmailOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = verifyEmailOtpSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const session = await loginWithEmailOtp(
    result.data.otpId,
    result.data.email,
    result.data.otp,
    getAuthContext(req),
  );
  res.status(200).json(session);
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = refreshTokenSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const session = await refreshSession(
    result.data.refreshToken,
    getAuthContext(req),
  );
  res.status(200).json(session);
};

export const logoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = refreshTokenSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  await logout(result.data.refreshToken);
  res.status(200).json({ message: "Logged out successfully" });
};

export const getSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {
    
};

export const revokeSession = async (
  req: Request,
  res: Response,
): Promise<void> => {};
