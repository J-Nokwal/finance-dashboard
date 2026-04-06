import { Router } from "express";
import { getCurerntUserInvitations, getCurrentUser } from "./user.controllers";
import { requireAuth } from "@/src/core/middleware/auth.middleware";



const router = Router(); // Base: /users

// USER ROUTES
router.get("/me", requireAuth,getCurrentUser); // Get current authenticated user's profile
router.get("/me/invitations",requireAuth,getCurerntUserInvitations ); // Get all users invitations (pending, accepted, rejected)



export default router;