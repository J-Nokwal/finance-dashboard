import {
  Invitation,
  Organization,
  Project,
  InvitationProject,
} from "@/generated/prisma/client";
import {
  InvitationStatus,
  OrganizationRole,
  OtpPurpose,
  ProjectRole,
} from "@/generated/prisma/enums";
import prisma from "@/src/core/config/prisma";
import resendService from "@/src/core/integrations/resend/resend.service";
import random from "@/src/utils/random";
import {
  InvitationWithProjects,
  OrganizationUserContext,
} from "./organisation.types";

/**
 * Creates a new organization with the given name and adds the given user as the owner.
 * @param {string} userId - the ID of the user to add as the owner
 * @param {string} name - the name of the organization to create
 * @returns {Promise<Organization>} a promise resolving to the newly created organization
 */
export async function createOrganization(
  userId: string,
  name: string,
  description?: string,
): Promise<Organization> {
  const org = await prisma.organization.create({
    data: {
      name,
      description,
      members: {
        create: {
          userId,
          role: OrganizationRole.OWNER,
        },
      },
    },
  });
  return org;
}

/**
 * Lists all organizations that the given user is a member of, filtered by the given owner filter.
 * If ownerFilter is true, only organizations where the user is the owner will be returned.
 * If ownerFilter is false, only organizations where the user is not the owner will be returned.
 * If ownerFilter is not provided, all organizations where the user is a member will be returned.
 * @param {string} userId - the ID of the user to filter by
 * @param {boolean} [ownerFilter] - whether to filter by owner (true), non-owner (false), or not filter at all (undefined)
 * @returns {Promise<Organization[]>} a promise resolving to an array of organizations that the user is a member of
 */
export async function listOrganizations(
  userId: string,
  ownerFilter?: boolean,
): Promise<Organization[]> {
  const orgs = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
          ...(ownerFilter === true
            ? { role: OrganizationRole.OWNER }
            : ownerFilter === false
              ? { role: { not: OrganizationRole.OWNER } }
              : {}),
        },
      },
    },
  });
  return orgs;
}

/**
 * Retrieves an organization by its ID.
 * @param {string} orgId - the ID of the organization to retrieve
 * @returns {Promise<Organization>} a promise resolving to the organization with the given ID, or null if not found
 */
export async function getOrganization(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  return org;
}

/**
 * Updates an organization with the given name and description.
 * If a name is provided, the organization's name will be updated.
 * If a description is provided, the organization's description will be updated.
 * @param {string} orgId - the ID of the organization to update
 * @param {string} [name] - the new name of the organization (optional)
 * @param {string} [description] - the new description of the organization (optional)
 * @returns {Promise<Organization>} a promise resolving to the updated organization
 */
export async function updateOrganization(
  orgId: string,
  name?: string,
  description?: string,
) :Promise<Organization>{
  const org = await prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(name && { name }),
      ...(description && { description }),
    },
  });
  return org;
}

/**
 * Generates a one-time password (OTP) for deleting an organization.
 * The generated OTP will be sent to the organization owner's email address
 * and will be valid for 15 minutes.
 * @param {string} organisationId - the ID of the organization to generate the OTP for
 * @returns {Promise<string>} a promise resolving to the ID of the generated OTP record
 * @throws {Error} if the organization owner email is not found
 * @throws {Error} if the organization does not exist
 */
export async function generateOrgDeletionOtp(organisationId: string) : Promise<string> {
  // 1. Get organization owner email
  const ownerOrgMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: organisationId,
      role: OrganizationRole.OWNER,
    },
    select: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  if (!ownerOrgMember || !ownerOrgMember.user.email) {
    throw new Error("Organization owner not found");
  }

  // 2. Invalidate any previous unused OTPs for this email
  await prisma.otpCode.updateMany({
    where: {
      email: ownerOrgMember.user.email,
      purpose: OtpPurpose.DELETE_ORGANIZATION,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() },
  });

  // 3. Get organization
  const organisation = await prisma.organization.findUnique({
    where: { id: organisationId },
  });
  if (!organisation) {
    throw new Error("Organization not found");
  }

  // 4. Send OTP
  const otp = random.generateOtp();
  await resendService.sendOrgDeletionOtp(
    ownerOrgMember.user.email,
    otp,
    organisation.name,
  );

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes
  // 5. Create new OTP record
  const otpRecord = await prisma.otpCode.create({
    data: {
      email: ownerOrgMember.user.email,
      codeHash: random.hashOtp(otp),
      purpose: OtpPurpose.DELETE_ORGANIZATION,
      expiresAt,
    },
  });

  return otpRecord.id;
}

export async function deleteOrganization(
  orgId: string,
  otp: string,
  otpId: string
): Promise<void> {
  // 1. Get organization owner email
  const ownerOrgMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      role: OrganizationRole.OWNER,
    },
    select: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  if (!ownerOrgMember || !ownerOrgMember.user.email) {
    throw new Error("Organization owner not found");
  }

  // 2. Validate OTP
  const validOtpRecord = await prisma.otpCode.findFirst({
    where: {
      id: otpId,
      email: ownerOrgMember.user.email,
      codeHash: random.hashOtp(otp),
      purpose: OtpPurpose.DELETE_ORGANIZATION,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  })
  if (!validOtpRecord) {
    throw new Error("Invalid or expired OTP");
  }

  // 3. Mark OTP as used
  await prisma.otpCode.update({
    where: { id: validOtpRecord.id },
    data: { usedAt: new Date() },
  });

  // 4. Proceed with organization deletion
  await prisma.$transaction(async (tx) => {
    // Delete all related projects, members, invitations in a transaction
    await tx.project.updateMany({
      where: { organizationId: orgId },
      data: { deletedAt: new Date() },
    });
    await tx.organizationMember.deleteMany({
      where: { organizationId: orgId },
    });
    await tx.invitation.deleteMany({
      where: { organizationId: orgId },
    });
    await tx.organization.updateMany({
      where: { id: orgId },
      data: { deletedAt: new Date() },
    });
  });

  return;
}

export async function listOrgMembers(orgId: string) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: { user: true },
  });
  return members;
}

export async function updateOrgMember(
  orgId: string,
  userId: string,
  role: OrganizationRole,
  crrOrgUserContext: OrganizationUserContext,
) {
  // Only allow changing role between MEMBER and ADMIN. OWNER role can only be assigned via ownership transfer, not directly.
  // only OWNER can add or remove admin role
  if (role === OrganizationRole.OWNER) {
    throw new Error(
      "Cannot assign OWNER role directly. Please transfer ownership instead.",
    );
  }
  const currentOwner = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      role: OrganizationRole.OWNER,
    },
  });
  if (currentOwner?.userId === userId) {
    throw new Error(
      "Cannot change role of the current OWNER. Please transfer ownership before changing role.",
    );
  }
  if (crrOrgUserContext.effectiveRole !== OrganizationRole.ADMIN) {
    throw new Error("Only OWNER can assign or remove ADMIN role");
  }
  const member = await prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        organizationId: orgId,
        userId,
      },
    },
    data: { organizationRole: role },
  });
  return member;
}

/**
 * Removes a member from an organization.
 * Only the current OWNER can remove ADMIN members.
 * If the user to be removed is the current OWNER, an error will be thrown.
 * @param {string} orgId - the ID of the organization to remove the member from
 * @param {string} userId - the ID of the user to remove from the organization
 * @param {OrganizationUserContext} crrOrgUserContext - the current user's organization context
 * @returns {Promise<void>} a promise resolving to void
 * @throws {Error} if the user is not a member of the organization
 * @throws {Error} if the current user is not an OWNER and is trying to remove an ADMIN member
 * @throws {Error} if the user to be removed is the current OWNER
 */
export async function removeOrgMember(
  orgId: string,
  userId: string,
  crrOrgUserContext: OrganizationUserContext,
):Promise<void> {
  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        organizationId: orgId,
        userId,
      },
    },
  });
  if (!orgMember) {
    throw new Error("User is not a member of the organization");
  }
  if (
    crrOrgUserContext.effectiveRole !== OrganizationRole.OWNER &&
    orgMember.organizationRole === OrganizationRole.ADMIN
  ) {
    throw new Error("Only OWNER  can remove ADMIN members");
  }
  const currentOwner = await prisma.organizationMember.findFirst({
    where: {
      organizationId: orgId,
      role: OrganizationRole.OWNER,
    },
  });
  if (currentOwner?.userId === userId) {
    throw new Error(
      "Cannot remove the current OWNER. Please transfer ownership before removing.",
    );
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Remove from all projects within this org
    await tx.projectMember.deleteMany({
      where: {
        userId,
        project: {
          organizationId: orgId,
        },
      },
    });

    // 2. Remove from the org
    await tx.organizationMember.delete({
      where: {
        userId_organizationId: { userId, organizationId: orgId },
      },
    });

    // 3. Revoke any pending invitations for this user in the org
    await tx.invitation.updateMany({
      where: {
        email: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
        organizationId: orgId,
        status: InvitationStatus.PENDING,
      },
      data: { status: InvitationStatus.REVOKED },
    });
    return;
  });
}

export async function listOrgInvitations(
  orgId: string,
  userId?: string,
  invitationStatus?: InvitationStatus[],
) {
  let userEmail: string;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    userEmail = user?.email || "";
  }

  const invitations = await prisma.invitation.findMany({
    where: {
      organizationId: orgId,
      ...(userId && { email: userEmail! }),
      ...(invitationStatus && { status: { in: invitationStatus } }),
    },
  });
  return invitations;
}

export async function inviteOrgMember(
  orgId: string,
  email: string,
  role: OrganizationRole,
  invitedByUserId: string,
  crrOrgUserContext: OrganizationUserContext,
  projectInvitations?: InvitationProject[],
): Promise<Invitation> {
  if (role === OrganizationRole.OWNER) {
    throw new Error(
      "Cannot assign OWNER role via invitation. Please transfer ownership after they join.",
    );
  }
  if (
    crrOrgUserContext.effectiveRole != OrganizationRole.OWNER &&
    role === OrganizationRole.ADMIN
  ) {
    throw new Error("Only OWNER can invite for ADMIN role");
  }

  const currentValidInvitation = await prisma.invitation.findMany({
    where: {
      organizationId: orgId,
      email,
      status: { in: [InvitationStatus.PENDING, InvitationStatus.ACCEPTED] },
    },
  });
  if (currentValidInvitation.length > 0) {
    throw new Error("User already invited");
  }

  // Validate project invitations in parallel for efficiency
  let validProjectInvites: InvitationProject[] = [];
  if (projectInvitations && projectInvitations.length > 0) {
    const projectChecks = await Promise.all(
      projectInvitations.map((pi) =>
        prisma.project.findUnique({
          where: { id: pi.projectId, organizationId: orgId },
          select: { id: true },
        })
      )
    );
    validProjectInvites = projectInvitations.filter((_, index) => projectChecks[index] !== null);
  }

  const invitation: InvitationWithProjects = await prisma.invitation.create({
    data: {
      organizationId: orgId,
      email,
      orgRole: role,
      invitedById: invitedByUserId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      token: random.generateRandomToken(),
      projectInvites: {
        create: validProjectInvites.map((pi) => ({
          projectId: pi.projectId,
          role: pi.role,
        })),
      },
    },
    include: {
      projectInvites: {
        include: {
          project: {
            select: { name: true },
          },
        },
      },
    },
  });
  resendService.sendOrganizationInvitationEmail(email, orgId, invitation);

  return invitation;
}

export async function revokeOrgInvitation(invitationId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new Error("Invitation not found");
  }
  if (
    invitation.status === InvitationStatus.ACCEPTED ||
    invitation.status === InvitationStatus.DECLINED ||
    invitation.status === InvitationStatus.EXPIRED
  ) {
    throw new Error("Only pending invitations can be revoked");
  }
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.REVOKED },
  });
}

export async function resendOrgInvitationEmail(invitationId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: {
      projectInvites: {
        include: {
          project: {
            select: { name: true },
          },
        },
      },
    },
  });
  if (!invitation) {
    throw new Error("Invitation not found");
  }
  await prisma.$transaction(async (tx) => {
    // Revoke old invitation
    await tx.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.REVOKED },
    });

    // Create new invitation with same details but new token and expiry
    const newInvitation: InvitationWithProjects = await tx.invitation.create({
      data: {
        organizationId: invitation.organizationId,
        email: invitation.email,
        orgRole: invitation.orgRole,
        invitedById: invitation.invitedById,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        token: random.generateRandomToken(),
        projectInvites: {
          create:
            invitation.projectInvites.map((pi) => ({
              projectId: pi.projectId,
              role: pi.role,
            })) || [],
        },
      },
      include: {
        projectInvites: {
          include: {
            project: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Send email for new invitation
    await resendService.sendOrganizationInvitationEmail(
      invitation.email,
      invitation.organizationId,
      newInvitation,
    );
  });
}

/**
 * Get all projects in the given organization.
 * If the current user is a member of the organization, only return projects
 * that the user is a member of. If the current user is an admin or owner of the organization,
 * return all projects in the organization.
 * @param {string} orgId - the ID of the organization to get projects from
 * @param {OrganizationUserContext} crrOrgUserContext - the current user's organization context
 * @returns {Promise<Project[]>} a promise resolving to an array of projects
 */
export async function getAllOrgProjects(
  orgId: string,
  crrOrgUserContext: OrganizationUserContext,
) {
  if (crrOrgUserContext.effectiveRole === OrganizationRole.MEMBER) {
    const projects = await prisma.project.findMany({
      where: {
        organizationId: orgId,
        members: {
          some: {
            userId: crrOrgUserContext.currentUserId,
          },
        },
      },
    });
    return projects;
  }
  const projects = await prisma.project.findMany({
    where: { organizationId: orgId },
  });
  return projects;
}

/**
 * Creates a new project in the given organization.
 * Only ADMINS and OWNERS can create projects.
 * @param {string} orgId - the ID of the organization to create the project in
 * @param {string} name - the name of the project to create
 * @param {OrganizationUserContext} crrOrgUserContext - the current user's organization context
 * @returns {Promise<Project>} a promise resolving to the newly created project
 * @throws {Error} if the current user is a MEMBER
 */
export async function createOrgProject(
  orgId: string,
  name: string,
  crrOrgUserContext: OrganizationUserContext,
) {
  if (crrOrgUserContext.effectiveRole === OrganizationRole.MEMBER) {
    throw new Error("MEMBER cannot create project");
  }
  const project = await prisma.project.create({
    data: {
      name,
      organizationId: orgId,
    },
  });
  return project;
}

// /**
//  * Gets a project by its ID.
//  * Only allows access to the project if the current user is an owner or admin of the organization.
//  * If the current user is a member, only allows access if the user is a member of the project.
//  * @param {string} projectId - the ID of the project to retrieve
//  * @param {OrganizationUserContext} crrOrgUserContext - the current user's organization context
//  * @returns {Promise<Project>} a promise resolving to the project with the given ID
//  * @throws {Error} if the current user is not a member of the project and is not an owner or admin of the organization
//  * @throws {Error} if the project is not found
//  */
// export async function getOrgProject(
//   projectId: string,
//   crrOrgUserContext: OrganizationUserContext,
// ): Promise<Project> {
//   const project = await prisma.project.findUnique({
//     where: {
//       id: projectId,
//     },
//   });

//   if (project && crrOrgUserContext.effectiveRole === OrganizationRole.MEMBER) {
//     const isMember = await prisma.projectMember.findFirst({
//       where: {
//         projectId,
//         userId: crrOrgUserContext.currentUser?.id,
//       },
//     });
//     if (!isMember) {
//       throw new Error("Access denied");
//     }
//   }
//   if (!project) {
//     throw new Error("Project not found");
//   }
//   return project;
// }
