import prisma from "@/src/core/config/prisma";
import { InvitationContext } from "./invitation.types";
import { InvitationStatus } from "@/generated/prisma/enums";

export async function acceptInvitation(
  invitationId: string,
  invitationContext: InvitationContext,
) {
  // get invitation
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { email: true, status: true },
  });
  if (!invitation) {
    throw new Error("Invitation not found");
  }
  if (invitation.status !== InvitationStatus.PENDING) {
    throw new Error("Invitation is not pending");
  }
  // get user from invitation context
  const user = await prisma.user.findUnique({
    where: { id: invitationContext.userAccessContext.userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("Invitation not found");
  }
  // update invitation status
  await prisma.$transaction(async (tx) => {
    const freshInvitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        projectInvites: {
          select: {
            projectId: true,
            domainInvites: true,
            role: true,
          },
        },
      },
    });
    if (
      !freshInvitation ||
      freshInvitation.status !== InvitationStatus.PENDING
    ) {
      throw new Error("Invitation is not pending");
    }

    const projectIds = freshInvitation.projectInvites.map((pi) => pi.projectId);

    const existingProjects = await tx.project.findMany({
      where: { id: { in: projectIds }, deletedAt: null, organizationId: freshInvitation.organizationId},
      select: { id: true },
    });

    const existingProjectIds = new Set(existingProjects.map((p) => p.id));

    const validProjectInvites = freshInvitation.projectInvites.filter((pi) =>
      existingProjectIds.has(pi.projectId),
    );

    for (const pi of validProjectInvites) {
      const projectMember = await tx.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: pi.projectId,
            userId: user.id,
          },
        },
        update: {
          projectRole: pi.role,
        },
        create: {
          projectId: pi.projectId,
          userId: user.id,
          projectRole: pi.role,
          addedById: freshInvitation.invitedById,
        },
      });

      if (pi.domainInvites.length > 0) {
        await tx.projectPermission.createMany({
          data: pi.domainInvites.map((di) => ({
            projectMemberId: projectMember.id,
            domain: di.domain,
            accessLevel: di.accessLevel,
          })),
          skipDuplicates: true,
        });
      }
    }

    await tx.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.ACCEPTED },
    });
  });
}

export async function rejectInvitation(
  invitationId: string,
  invitationContext: InvitationContext,
) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new Error("Invitation not found");
  }
  if (invitation.status !== InvitationStatus.PENDING) {
    throw new Error("Invitation is not pending");
  }
  // get user from invitation context
  const user = await prisma.user.findUnique({
    where: { id: invitationContext.userAccessContext.userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.email !== invitation.email) {
    throw new Error("Invitation not found");
  }
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.DECLINED },
  });
}
