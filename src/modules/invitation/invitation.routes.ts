import { Router } from "express";
import { acceptInvitation, rejectInvitation } from "./invitaion.controllers";
import { requireAuth, requireSession } from "@/src/core/middleware/auth.middleware";



const router = Router(); // Base: /invitations


// INVITATION ROUTES

//For users to manage their invitations 
router.post("/:invitationId/accept",requireAuth,requireSession, acceptInvitation); // Accept an invitation
router.post("/:invitationId/reject",requireAuth,requireSession,rejectInvitation ); // Reject an invitation 


export default router;