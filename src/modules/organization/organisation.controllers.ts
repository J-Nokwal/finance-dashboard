import { Request, Response } from "express";
import {
  createOrganizationProjectSchema,
  createOrganizationSchema,
  deleteOrganizationSchema,
  deleteOrgProjectParamSchema,
  inviteOrganizationMemberSchema,
  listOrganizationInvitationsQuerySchema,
  removeOrgMemberParamSchema,
  resendOrgInvitationParamSchema,
  revokeOrgInvitationParamSchema,
  updateOrganizationMemberSchema,
  updateOrganizationSchema,
  updateOrgMemberParamSchema,
} from "./organisation.validations";
import { z } from "zod";
import {
  createOrganization,
  createOrgProject,
  deleteOrganization,
  deleteOrgProject,
  generateOrgDeletionOtp,
  getAllOrgProjects,
  getOrganization,
  inviteOrgMember,
  listOrganizations,
  listOrgInvitations,
  listOrgMembers,
  removeOrgMember,
  resendOrgInvitationEmail,
  revokeOrgInvitation,
  updateOrganization,
  updateOrgMember,
} from "./organisation.services";
import { OrganizationContext } from "./organisation.types";

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrganizationMember:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [OWNER, ADMIN, MEMBER]
 *     Invitation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         organizationId:
 *           type: string
 *           format: uuid
 */

// Organization

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create organization
 *     description: Create a new organization.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corp"
 *               description:
 *                 type: string
 *                 example: "A leading finance company"
 *     responses:
 *       201:
 *         description: Organization created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const createOrganizationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userAccessContext!.userId;
  const result = createOrganizationSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const organization = await createOrganization(
    userId,
    result.data.name,
    result.data.description,
  );
  res.status(201).json(organization);
};

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: List organizations
 *     description: List all organizations for the authenticated user.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ownerFilter
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by ownership (true = only owned, false = only not owned)
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const listOrganizationsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userAccessContext!.userId;
  const { ownerFilterQuery } = req.query;
  const ownerFilter: boolean | undefined =
    ownerFilterQuery === "true"
      ? true
      : ownerFilterQuery === "false"
        ? false
        : undefined;
  const organizations = await listOrganizations(userId, ownerFilter);
  res.status(200).json(organizations);
};

/**
 * @swagger
 * /api/organizations/{orgId}:
 *   get:
 *     summary: Get organization
 *     description: Get details of a specific organization.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
export const getOrganizationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const organization = await getOrganization(organizationId);
  res.status(200).json(organization);
};

/**
 * @swagger
 * /api/organizations/{orgId}:
 *   patch:
 *     summary: Update organization
 *     description: Update an organization's information. Requires ADMIN role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corp Updated"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
export const updateOrganizationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const result = updateOrganizationSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }

  const organization = await getOrganization(organizationId);
  if (!organization) {
    res.status(404).json({ message: "Organization not found" });
    return;
  }

  const updatedOrganization = await updateOrganization(
    organizationId,
    result.data.name,
    result.data.description,
  );
  res.status(200).json(updatedOrganization);
};

/**
 * @swagger
 * /api/organizations/{orgId}/org-delete-otp:
 *   post:
 *     summary: Request organization deletion OTP
 *     description: Request an OTP for deleting an organization. Requires OWNER role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires OWNER role
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
export const requestOrgDeletionOtpController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const otpId = await generateOrgDeletionOtp(organizationId);
  res.status(200).json({ otpId });
};

/**
 * @swagger
 * /api/organizations/{orgId}:
 *   delete:
 *     summary: Delete organization
 *     description: Delete an organization permanently. Requires OWNER role and OTP verification.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpId
 *               - otp
 *             properties:
 *               otpId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organization deleted successfully"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires OWNER role
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
export const deleteOrganizationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const result = deleteOrganizationSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: z.treeifyError(result.error) });
    return;
  }
  await deleteOrganization(organizationId, result.data.otp, result.data.otpId);
  res.status(200).json({ message: "Organization deleted successfully" });
};

// Organization Members

/**
 * @swagger
 * /api/organizations/{orgId}/members:
 *   get:
 *     summary: List organization members
 *     description: List all members of an organization.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *     responses:
 *       200:
 *         description: List of organization members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrganizationMember'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error
 */
export const listOrgMembersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const members = await listOrgMembers(organizationId);
  res.status(200).json(members);
};

/**
 * @swagger
 * /api/organizations/{orgId}/members/{userId}:
 *   patch:
 *     summary: Update organization member role
 *     description: Update a member's role in an organization. Requires ADMIN role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *                 enum: [OWNER, ADMIN, MEMBER]
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationMember'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
export const updateOrgMemberController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = updateOrgMemberParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
  const bodyResult = updateOrganizationMemberSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }
  if (bodyResult.data.userId !== paramsResult.data.userId) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }

  const organizationContext: OrganizationContext = {
    userAccessContext: req.userAccessContext!,
    organizationAccessContext: req.organizationAccessContext!,
  }
  const updatedMember = await updateOrgMember(
    bodyResult.data.userId,
    bodyResult.data.role,
    organizationContext,
  );
  res
    .status(200)
    .json(updatedMember || { message: "Member updated successfully" });
};

/**
 * @swagger
 * /api/organizations/{orgId}/members/{userId}:
 *   delete:
 *     summary: Remove organization member
 *     description: Remove a member from an organization. Requires ADMIN role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Member removed successfully"
 *       400:
 *         description: Invalid member ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
export const removeOrgMemberController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = removeOrgMemberParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const organizationContext: OrganizationContext = {
    userAccessContext: req.userAccessContext!,
    organizationAccessContext: req.organizationAccessContext!,
  }

   await removeOrgMember(
    paramsResult.data.userId,
    organizationContext,
  );
  res.status(200).json({ message: "Member removed successfully" });
};


// Invitations

/**
 * @swagger
 * /api/organizations/{orgId}/invitations:
 *   get:
 *     summary: List organization invitations
 *     description: List all invitations for an organization. Requires ADMIN role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [PENDING, ACCEPTED, REJECTED]
 *         description: Filter by invitation status
 *     responses:
 *       200:
 *         description: List of invitations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       500:
 *         description: Server error
 */
export const listOrgInvitationsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { organizationId } = req.organizationAccessContext!;
  const queryResult = listOrganizationInvitationsQuerySchema.safeParse(
    req.query,
  );
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const invitations = await listOrgInvitations(
    organizationId,
    queryResult.data.userId,
    queryResult.data.status,
  );
  res.status(200).json(invitations);
};

/**
 * @swagger
 * /api/organizations/{orgId}/invitations:
 *   post:
 *     summary: Invite organization member
 *     description: Send an invitation to a user to join an organization. Requires ADMIN role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               role:
 *                 type: string
 *                 enum: [OWNER, ADMIN, MEMBER]
 *               projectInvitations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     projectId:
 *                       type: string
 *                       format: uuid
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, MEMBER, VIEWER]
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invitation'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       409:
 *         description: User already invited or is already a member
 *       500:
 *         description: Server error
 */
export const inviteOrgMemberController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const bodyResult = inviteOrganizationMemberSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }
    const organizationContext: OrganizationContext = {
    userAccessContext: req.userAccessContext!,
    organizationAccessContext: req.organizationAccessContext!,
  }
  const invitedMember = await inviteOrgMember(
    bodyResult.data.email,
    bodyResult.data.role,
    organizationContext,
    bodyResult.data.projectInvitations,
  );
  res.status(200).json(invitedMember);
};

/**
 * @swagger
 * /api/organizations/{orgId}/invitations/{invitationId}:
 *   delete:
 *     summary: Revoke organization invitation
 *     description: Revoke a pending organization invitation. Requires ADMIN role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The invitation ID
 *     responses:
 *       200:
 *         description: Invitation revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation revoked successfully"
 *       400:
 *         description: Invalid invitation ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
export const revokeOrgInvitationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = revokeOrgInvitationParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
  const organizationContext: OrganizationContext = {
    userAccessContext: req.userAccessContext!,
    organizationAccessContext: req.organizationAccessContext!,
  }
  await revokeOrgInvitation(
    paramsResult.data.invitationId,
    organizationContext,
  );
  res.status(200).json({ message: "Invitation revoked successfully" });
};

/**
 * @swagger
 * /api/organizations/{orgId}/invitations/{invitationId}/resend:
 *   post:
 *     summary: Resend organization invitation
 *     description: Resend an organization invitation email. Requires ADMIN role.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The invitation ID
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation resent successfully"
 *       400:
 *         description: Invalid invitation ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
export const resendOrgInvitationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = resendOrgInvitationParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
  const organizationContext: OrganizationContext = {
    userAccessContext: req.userAccessContext!,
    organizationAccessContext: req.organizationAccessContext!,
  }
  await resendOrgInvitationEmail(
    paramsResult.data.invitationId,
    organizationContext,
  );
  res.status(200).json({ message: "Invitation resent successfully" });
};

/**
 * @swagger
 * /api/organizations/{orgId}/projects:
 *   get:
 *     summary: List organization projects
 *     description: Retrieve all projects associated with an organization.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
// Projects
export const listOrgProjectsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationContext: OrganizationContext ={
    organizationAccessContext: req.organizationAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
  const projects = await getAllOrgProjects(organizationContext);
  res.status(200).json(projects);
};

/**
 * @swagger
 * /api/organizations/{orgId}/projects:
 *   post:
 *     summary: Create organization project
 *     description: Create a new project under an organization. Requires ADMIN access.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Project"
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       500:
 *         description: Server error
 */
export const createOrgProjectController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationContext: OrganizationContext = {
    userAccessContext: req.userAccessContext!,
    organizationAccessContext: req.organizationAccessContext!,
  }
  const bodyResult = createOrganizationProjectSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }
  const project = await createOrgProject(bodyResult.data.name,organizationContext);
  res.status(201).json(project);
};

/**
 * @swagger
 * /api/organizations/{orgId}/projects/{projectId}:
 *   delete:
 *     summary: Delete organization project
 *     description: Remove a project from an organization. Requires ADMIN access.
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The organization ID
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project deleted successfully"
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export const deleteOrgProjectController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = deleteOrgProjectParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
  const organizationContext: OrganizationContext = {
    userAccessContext: req.userAccessContext!,
    organizationAccessContext: req.organizationAccessContext!,
  }
  await deleteOrgProject(paramsResult.data.projectId,organizationContext);
  res.status(200).json({ message: "Project deleted successfully" });
};