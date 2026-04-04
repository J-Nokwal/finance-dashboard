import { Router } from "express";
import { acceptInvitation, rejectInvitation } from "./invitaion.controllers";



const router = Router(); // Base: /invitations


// INVITATION ROUTES

//For users to manage their invitations 
router.post("/:invitationId/accept", acceptInvitation); // Accept an invitation
router.post("/:invitationId/reject",rejectInvitation ); // Reject an invitation 


export default router;