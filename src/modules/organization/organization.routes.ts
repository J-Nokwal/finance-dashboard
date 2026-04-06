import { Router } from "express";
import {
  createOrganizationController,
  listOrganizationsController,
  getOrganizationController,
  updateOrganizationController,
  deleteOrganizationController,
  listOrgMembersController,
  updateOrgMemberController,
  removeOrgMemberController,
  changeOrgMemberRoleController,
  listOrgInvitationsController,
  inviteOrgMemberController,
  revokeOrgInvitationController,
  resendOrgInvitationController,
  listOrgProjectsController,
  createOrgProjectController,
  requestOrgDeletionOtpController,
} from "./organisation.controllers";
import {
  requireAuth,
  requireSession,
} from "@/src/core/middleware/auth.middleware";
import { loadOrganizationAccessContext } from "@/src/core/middleware/organization.middleware";
import { requireRole } from "@/src/core/middleware/rbac.middleware";
import { OrganizationRole } from "@/generated/prisma/enums";

const router = Router(); // Base: /organizations

// Organization
router.post("/", requireAuth, createOrganizationController);
router.get("/", requireAuth, listOrganizationsController);
router.get(
  "/:orgId",
  requireAuth,
  loadOrganizationAccessContext,
  getOrganizationController,
);
router.patch(
  "/:orgId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER,OrganizationRole.ADMIN]),
  updateOrganizationController,
);
router.post(
  "/:orgId/org-delete-otp",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER]),
  requestOrgDeletionOtpController,
);
router.delete(
  "/:orgId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER]),
  deleteOrganizationController,
);

// Organization Members
router.get(
  "/:orgId/members",
  requireAuth,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER,OrganizationRole.ADMIN]),
  listOrgMembersController,
);
router.patch(
  "/:orgId/members/:userId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER,OrganizationRole.ADMIN]),
  updateOrgMemberController,
);
router.delete(
  "/:orgId/members/:userId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER,OrganizationRole.ADMIN]),
  removeOrgMemberController,
);

// Role Management
router.patch(
  "/:orgId/members/:userId/role",
  requireAuth,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER]),
  changeOrgMemberRoleController,
);

// Invitations
router.get(
  "/:orgId/invitations",
  requireAuth,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER,OrganizationRole.ADMIN]),
  listOrgInvitationsController,
);
router.post(
  "/:orgId/invitations",
  requireAuth,
  loadOrganizationAccessContext,
  requireRole([OrganizationRole.OWNER,OrganizationRole.ADMIN]),
  inviteOrgMemberController,
);
router.delete(
  "/:orgId/invitations/:invitationId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  revokeOrgInvitationController,
);
router.post(
  "/:orgId/invitations/:invitationId/resend",
  requireAuth,
  loadOrganizationAccessContext,
  resendOrgInvitationController,
);

// Projects
router.get(
  "/:orgId/projects",
  requireAuth,
  loadOrganizationAccessContext,
  listOrgProjectsController,
);
router.post(
  "/:orgId/projects",
  requireAuth,
  loadOrganizationAccessContext,
  createOrgProjectController,
);
export default router;
