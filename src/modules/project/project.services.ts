import prisma from "@/src/core/config/prisma";
import { ProjectContext } from "./project.types";
import {
  ProjectMember,
  ProjectPermission,
  ProjectRole,
} from "@/generated/prisma/client";
import { canManageProjectRole } from "@/src/core/rbac/resolver";

export async function getProject(projectContext: ProjectContext) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectContext.projectAccessContext.projectId,
    },
  });
  return project;
}

export async function updateProject(projectContext: ProjectContext) {
  const project = await prisma.project.update({
    where: {
      id: projectContext.projectAccessContext.projectId,
    },
    data: {
      name: projectContext.projectAccessContext.project.name,
    },
  });
  return project;
}

export async function getProjectMembers(
  projectContext: ProjectContext,
): Promise<ProjectMember[]> {
  const projectMembers = await prisma.projectMember.findMany({
    where: {
      projectId: projectContext.projectAccessContext.projectId,
    },
  });
  return projectMembers;
}

export async function addProjectMember(
  userId: string,
  projectRole: ProjectRole,
  projectPermissions: ProjectPermission[],
  projectContext: ProjectContext,
) {
  if (
    !canManageProjectRole(
      projectContext.projectAccessContext.orgRole,
      projectContext.projectAccessContext.projectRole,
      projectRole,
    ) || projectContext.userAccessContext.userId === userId
  ) {
    throw new Error("Insufficient permissions");
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: projectContext.projectAccessContext.projectId,
        userId: userId,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member");
  }

  const projectMember = await prisma.projectMember.create({
    data: {
      projectId: projectContext.projectAccessContext.projectId,
      userId: userId,
      addedById: projectContext.userAccessContext.userId,
      projectRole: projectRole,
      permissions: {
        createMany: {
          data: projectPermissions.map((permission) => ({
            domain: permission.domain,
            accessLevel: permission.accessLevel,
          })),
        },
      },
    },
  });
  return projectMember;
}

export async function updateProjectMember(
  userId: string,
  projectRole: ProjectRole,
  permissions: ProjectPermission[],
  projectContext: ProjectContext,
) {
  const { projectId, orgRole, projectRole: currentUserProjectRole } =
    projectContext.projectAccessContext;

  if (
    !canManageProjectRole(
      orgRole,
      currentUserProjectRole,
      projectRole,
    )
  ) {
    throw new Error("Insufficient permissions");
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    include: {
      permissions: true,
    },
  });

  if (!existingMember) {
    throw new Error("Project member not found");
  }

  if (existingMember.userId === projectContext.userAccessContext.userId) {
    throw new Error("You cannot update your own role");
  }

  const updatedMember = await prisma.$transaction(async (tx) => {
    await tx.projectPermission.deleteMany({
      where: {
        projectMemberId: existingMember.id,
      },
    });

    const member = await tx.projectMember.update({
      where: {
        id: existingMember.id,
      },
      data: {
        projectRole,
      },
    });

    if (permissions.length > 0) {
      await tx.projectPermission.createMany({
        data: permissions.map((p) => ({
          projectMemberId: existingMember.id,
          domain: p.domain,
          accessLevel: p.accessLevel,
        })),
      });
    }

    return member;
  });

  return updatedMember;
}

export async function deleteProjectMember(
  userId: string,
  projectContext: ProjectContext,
) {
  const { projectId, orgRole, projectRole } =
    projectContext.projectAccessContext;

  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!existingMember) {
    throw new Error("Project member not found");
  }

  if (
    !canManageProjectRole(
      orgRole,
      projectRole,
      existingMember.projectRole,
    )
  ) {
    throw new Error("Insufficient permissions");
  }

  if (userId === projectContext.userAccessContext.userId) {
    throw new Error("You cannot remove yourself from the project");
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectPermission.deleteMany({
      where: {
        projectMemberId: existingMember.id,
      },
    });

    await tx.projectMember.delete({
      where: {
        id: existingMember.id,
      },
    });
  });

  return ;
}