import { UserModel } from "../../../generated/prisma/models";
import jwt from "jsonwebtoken";
import prisma from "../../../src/core/config/prisma";
import { AuthProvider, OtpPurpose } from "../../../generated/prisma/enums";
import crypto from "crypto";
import { AuthContext, SendOtpResponse, SessionData } from "./auth.types";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import resendService from "../../core/integrations/resend/resend.service";

const SALT_ROUNDS = 12; // cost factor — higher = slower = safer
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function loginWithGoogle(
  idToken: string,
  context: AuthContext,
): Promise<SessionData> {
  const g = await verifyGoogleToken(idToken);

  let account = await prisma.authAccount.findUnique({
    where: {
      provider_providerId: {
        provider: AuthProvider.GOOGLE,
        providerId: g.sub,
      },
    },
    include: { user: true },
  });

  if (!account) {
    let user = await prisma.user.findUnique({
      where: { email: g.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: g.email,
          name: g.name,
          avatar: g.picture,
        },
      });
      try {
        resendService.sendRegistrationSuccessEmail(
          g.email,
          user.name ?? "User",
        );
      } catch (error) {
        console.error("❌ Failed to send email of registration success", error);
      }
    }

    account = await prisma.authAccount.create({
      data: {
        userId: user.id,
        provider: AuthProvider.GOOGLE,
        providerId: g.sub,
      },
      include: { user: true },
    });
  }

  const {refreshToken, sessionId} = await createSession(account!.user.id, context);
  const jwt = generateJWT(account!.user, sessionId);
  return {
    refreshToken,
    jwt,
  };
}

async function verifyGoogleToken(idToken: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture: string;
}> {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID, // ensures the token was meant for YOUR app
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token");
  }
  if (!payload.email_verified) {
    throw new Error("Google email is not verified");
  }

  return {
    sub: payload.sub, // stable unique Google user ID
    email: payload.email!,
    name: payload.name ?? "",
    picture: payload.picture ?? "",
  };
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
): Promise<void> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: email.split("@")[0] },
    });
    try {
      await resendService.sendRegistrationSuccessEmail(
        email,
        user.name ?? "User",
      );
    } catch (error) {
      console.error("Failed to send email of registration success", error);
    }
  } else {
    console.log(`User with email ${email} already exists`);
  }

  await prisma.authAccount.create({
    data: {
      userId: user.id,
      provider: AuthProvider.EMAIL_PASSWORD,
      providerId: email,
      passwordHash, // store the hash, never the raw password
    },
  });
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
  context: AuthContext,
): Promise<SessionData> {
  const account = await prisma.authAccount.findUnique({
    where: {
      provider_providerId: {
        provider: AuthProvider.EMAIL_PASSWORD,
        providerId: email,
      },
    },
    include: { user: true },
  });
  // ✅ bcrypt.compare handles the hash comparison safely
  const isValid =
    account?.passwordHash &&
    (await bcrypt.compare(password, account.passwordHash));

  if (!account || !isValid) {
    throw new Error("Invalid email or password");
  }

  const {refreshToken, sessionId} = await createSession(account.user.id, context);
  const jwt = generateJWT(account.user, sessionId);
  return {
    refreshToken,
    jwt,
  };
}
function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0"); // 6 digits
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
export async function sendLoginOtp(email: string): Promise<SendOtpResponse> {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any previous unused OTPs for this email
  await prisma.otpCode.updateMany({
    where: {
      email,
      purpose: OtpPurpose.LOGIN,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() },
  });

  const otpRecord = await prisma.otpCode.create({
    data: {
      email,
      codeHash: hashOtp(otp),
      purpose: OtpPurpose.LOGIN,
      expiresAt,
    },
  });

  await resendService.sendLoginOtpEmail(email, otp);

  return { otpId: otpRecord.id };
}

export async function loginWithEmailOtp(
  otpId: string, 
  email: string,
  otp: string,
  context: AuthContext,
): Promise<SessionData> {
  const record = await prisma.otpCode.findFirst({
    where: {
      id: otpId, 
      codeHash: hashOtp(otp),
      purpose: OtpPurpose.LOGIN,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new Error("Invalid OTP");
  }
  if (record.expiresAt < new Date()) {
    throw new Error("OTP has expired");
  }
  // Mark as used — one time use only
  await prisma.otpCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  // Auto-create user if they don't exist yet
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: email.split("@")[0] },
    });
    try {
      resendService.sendRegistrationSuccessEmail(email, user.name ?? "User");
    } catch (error) {
      console.error("❌ Failed to send email of registration success", error);
    }
  }

  // Upsert the EMAIL_OTP auth account
  await prisma.authAccount.upsert({
    where: {
      provider_providerId: {
        provider: AuthProvider.EMAIL_OTP,
        providerId: email,
      },
    },
    create: {
      userId: user.id,
      provider: AuthProvider.EMAIL_OTP,
      providerId: email,
    },
    update: {},
  });

  const {refreshToken, sessionId} = await createSession(user.id, context);
  const token = generateJWT(user,sessionId);

  return { refreshToken, jwt: token };
}

export async function logout(refreshToken: string) {
  await prisma.authSession.deleteMany({
    where: { refreshToken },
  });
}

export async function refreshSession(
  refreshToken: string,
  context: AuthContext,
): Promise<SessionData> {
  const session = await prisma.authSession.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  const {refreshToken: newRefreshToken, sessionId} = await createSession(session.userId, context);
  const jwt = generateJWT(session.user, sessionId);
  return {
    refreshToken: newRefreshToken,
    jwt: jwt,
  };
}

async function createSession(
  userId: string,
  context: AuthContext,
): Promise<{ refreshToken: string , sessionId: string}> {
  const refreshToken = crypto.randomBytes(32).toString("hex");
 const session = await prisma.authSession.create({
    data: {
      userId,
      refreshToken,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  return {refreshToken, sessionId: session.id}; // using refreshToken as sessionId for simplicity
}

function generateJWT(user: UserModel , sessionId: string): string {
  return jwt.sign({ sub: user.id,jti: sessionId }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
}

export async function getAllSessions(userId: string) {
  return prisma.authSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeSession(refreshToken: string) {
  await prisma.authSession.deleteMany({
    where: { refreshToken },
  });
}

export async function revokeAllSessionsForUser(userId: string) {
  await prisma.authSession.deleteMany({
    where: { userId },
  });
}