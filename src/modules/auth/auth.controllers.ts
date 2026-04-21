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

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Sign in with Google
 *     description: Authenticate user with Google OAuth using an ID token. Creates a new account if user doesn't exist.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google OAuth ID token
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazM..."
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionData'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Invalid Google ID token
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/email/register:
 *   post:
 *     summary: Register with email and password
 *     description: Create a new user account using email and password authentication.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User's password (minimum 8 characters)
 *                 example: "SecurePass123!"
 *               name:
 *                 type: string
 *                 description: User's display name (optional)
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account created successfully"
 *       400:
 *         description: Invalid request body or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/email/password:
 *   post:
 *     summary: Login with email and password
 *     description: Authenticate user with email and password credentials.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "jagritnokwal9@gmail.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "qwer1234"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionData'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/email/otp/send:
 *   post:
 *     summary: Send OTP to email
 *     description: Send a one-time password (OTP) to the user's email for authentication.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address to send OTP to
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 otpId:
 *                   type: string
 *                   format: uuid
 *                   description: OTP session ID to use for verification
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *       400:
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/email/otp/verify:
 *   post:
 *     summary: Verify OTP and login
 *     description: Verify the OTP sent to the user's email and authenticate the user.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otpId
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               otpId:
 *                 type: string
 *                 format: uuid
 *                 description: OTP session ID received from send OTP endpoint
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 description: 6-digit OTP code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionData'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh the access token using a valid refresh token. Requires authentication.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionData'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate the current session and logout the user. Requires authentication.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to invalidate
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Get all user sessions
 *     description: Retrieve all active sessions for the authenticated user. Requires authentication.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   userAgent:
 *                     type: string
 *                   ipAddress:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   lastActiveAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Server error
 */
export const getSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {

};

/**
 * @swagger
 * /api/auth/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     description: Revoke/logout a specific session by ID. Requires authentication.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The session ID to revoke
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token for verification
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Session revoked successfully"
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
export const revokeSession = async (
  req: Request,
  res: Response,
): Promise<void> => {};
