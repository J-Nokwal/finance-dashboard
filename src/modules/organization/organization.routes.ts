import { Router } from "express";
import {
  createOrganization,
  listOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  listOrgMembers,
  addOrgMember,
  updateOrgMember,
  removeOrgMember,
  changeOrgMemberRole,
  listOrgInvitations,
  inviteOrgMember,
  revokeOrgInvitation,
  resendOrgInvitation,
  listOrgProjects,
  createOrgProject,
} from "./organisation.controllers";

const router = Router(); // Base: /organizations

// Organization
router.post("/", createOrganization);                           // Create a new organization
router.get("/", listOrganizations);                             // List organizations the user belongs to
router.get("/:orgId", getOrganization);                        // Get organization details
router.patch("/:orgId", updateOrganization);                   // Update organization information
router.delete("/:orgId", deleteOrganization);                  // Delete an organization (soft delete preferred)

// Organization Members
router.get("/:orgId/members", listOrgMembers);                 // List members of an organization
router.post("/:orgId/members", addOrgMember);                  // Invite/add a member to the organization
router.patch("/:orgId/members/:userId", updateOrgMember);      // Update member information (e.g., role)
router.delete("/:orgId/members/:userId", removeOrgMember);     // Remove a member from the organization

// Role Management
router.patch("/:orgId/members/:userId/role", changeOrgMemberRole); // Change a member's role within the organization

// Invitations
router.get("/:orgId/invitations", listOrgInvitations);                         // List all invitations for the organization
router.post("/:orgId/invitations", inviteOrgMember);                           // Invite a user to the organization
router.delete("/:orgId/invitations/:invitationId", revokeOrgInvitation);       // Revoke an invitation
router.post("/:orgId/invitations/:invitationId/resend", resendOrgInvitation);  // Resend an invitation

// Projects
router.get("/:orgId/projects", listOrgProjects);   // List projects within an organization
router.post("/:orgId/projects", createOrgProject); // Create a new project within an organization

export default router;