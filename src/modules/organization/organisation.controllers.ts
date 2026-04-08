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

// Organization
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

export const getOrganizationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const organization = await getOrganization(organizationId);
  res.status(200).json(organization);
};

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

export const requestOrgDeletionOtpController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const otpId = await generateOrgDeletionOtp(organizationId);
  res.status(200).json({ otpId });
};

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
export const listOrgMembersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const organizationId = req.organizationAccessContext!.organizationId;
  const members = await listOrgMembers(organizationId);
  res.status(200).json(members);
};

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