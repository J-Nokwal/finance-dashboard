import { Router } from "express";
import { getCurerntUserInvitations, getCurrentUser } from "./user.controllers";



const router = Router(); // Base: /users

// USER ROUTES
router.get("/me", getCurrentUser); // Get current authenticated user's profile
router.get("/me/invitations",getCurerntUserInvitations ); // Get all users invitations (pending, accepted, rejected)



export default router;