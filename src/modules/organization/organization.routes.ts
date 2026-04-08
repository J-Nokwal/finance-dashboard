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
  listOrgInvitationsController,
  inviteOrgMemberController,
  revokeOrgInvitationController,
  resendOrgInvitationController,
  listOrgProjectsController,
  createOrgProjectController,
  requestOrgDeletionOtpController,
  deleteOrgProjectController,
} from "./organisation.controllers";
import {
  requireAuth,
  requireSession,
} from "@/src/core/middleware/auth.middleware";
import { loadOrganizationAccessContext } from "@/src/core/middleware/organization.middleware";
import { OrganizationRole } from "@/generated/prisma/enums";
import { requireOrgRole } from "@/src/core/middleware/rbac.middleware";

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
  requireOrgRole(OrganizationRole.ADMIN),
  updateOrganizationController,
);
router.post(
  "/:orgId/org-delete-otp",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireOrgRole(OrganizationRole.OWNER),
  requestOrgDeletionOtpController,
);
router.delete(
  "/:orgId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireOrgRole(OrganizationRole.OWNER),
  deleteOrganizationController,
);

// Organization Members
router.get(
  "/:orgId/members",
  requireAuth,
  loadOrganizationAccessContext,
  listOrgMembersController,
);
router.patch(
  "/:orgId/members/:userId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireOrgRole(OrganizationRole.ADMIN),
  updateOrgMemberController,
);
router.delete(
  "/:orgId/members/:userId",
  requireAuth,
  requireSession,
  loadOrganizationAccessContext,
  requireOrgRole(OrganizationRole.ADMIN),
  removeOrgMemberController,
);

// Invitations
router.get(
  "/:orgId/invitations",
  requireAuth,
  loadOrganizationAccessContext,
  requireOrgRole(OrganizationRole.ADMIN),
  listOrgInvitationsController,
);
router.post(
  "/:orgId/invitations",
  requireAuth,
  loadOrganizationAccessContext,
  requireOrgRole(OrganizationRole.ADMIN),
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
  requireOrgRole(OrganizationRole.ADMIN),
  createOrgProjectController,
);
router.delete(
  "/:orgId/projects/:projectId",
  requireAuth,
  loadOrganizationAccessContext,
  requireOrgRole(OrganizationRole.ADMIN),
  deleteOrgProjectController,
)
export default router;
