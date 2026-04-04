import { Router } from "express";
import { sendEmailOtp, verifyEmailOtp, emailPasswordLogin, emailPasswordRegister, getSessions, googleSignIn, logout, refreshAccessToken, revokeSession } from "./auth.controllers";


const router = Router(); // Base: /auth

// Authentication
router.post("/logout",logout); // Invalidate the current session (logout)
router.post("/refresh",refreshAccessToken); // Refresh the access token using a valid refresh token

// Providers
router.post("/google",googleSignIn); // Handle Google OAuth login/register
router.post("/email/register",emailPasswordRegister); // Register a new user with email and password
router.post("/email/password",emailPasswordLogin); // Login with email and password
router.post("/email/otp/send",sendEmailOtp); // Send an OTP to the user's email for login
router.post("/email/otp/verify",verifyEmailOtp); // Verify the OTP and log the user in

// Sessions
router.get("/sessions",getSessions); // Get all current sessions for the authenticated user
router.delete("/sessions/:sessionId",revokeSession); // Revoke a specific session (logout from that session)

export default router;
