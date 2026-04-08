import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { ProjectRequest } from "../types/middleware.types";
import { DomainAccess, ProjectDomain } from "@/generated/prisma/enums";
import { getEffectiveProjectRole } from "../rbac/resolver";

export async function loadProjectAccessContext(
  req: ProjectRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.userAccessContext === undefined) {
    res.status(401).json({
      success: false,
      message: "Session is invalid or has been revoked. Add requireAuth middleware first.",
      code: "SESSION_INVALID",
    });
    return;
  }

  const userId = req.userAccessContext.userId;
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== "string") {
    res.status(400).json({
      success: false,
      message: "Project ID is required and must be a string.",
      code: "PROJECT_ID_INVALID",
    });
    return;
  }

  // Single query — fetch project + both memberships at once
  const project = await prisma.project.findUnique({
    where: { id: projectId, AND: { deletedAt: null } },
    include: {
      organization: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
      members: {
        where: { userId },
      },
    },
  });

  if (!project || project.deletedAt) {
    res.status(404).json({
      success: false,
      message: "Project not found.",
      code: "PROJECT_NOT_FOUND",
    });
    return;
  }

  const orgMembership = project.organization.members[0] ?? null;
  const projectMembership = project.members[0] ?? null;

  // Not even in the org
  if (!orgMembership) {
    res.status(403).json({
      success: false,
      message: "You do not have access to this organization.",
      code: "ORG_ACCESS_FORBIDDEN",
    });
    return;
  }

  const effectiveRole = getEffectiveProjectRole(
    orgMembership.organizationRole,
    projectMembership?.projectRole ?? null,
  );

  // Org MEMBER with no project membership = no access
  if (!effectiveRole) {
    res.status(403).json({
      success: false,
      message: "You do not have access to this project.",
      code: "PROJECT_ACCESS_FORBIDDEN",
    });
    return;
  }

  req.projectAccessContext = {
    project,
    projectId,
    organizationId: project.organizationId,
    orgRole: orgMembership.organizationRole,
    projectRole: projectMembership?.projectRole ?? null,
    effectiveRole,
  };
  next();
}

export function requireDomainAccess(domain: ProjectDomain, minimum: DomainAccess) {
  const hierarchy: Record<DomainAccess, number> = {
    READ:   1,
    WRITE:  2,
    MANAGE: 3,
  };

  return async (req: ProjectRequest, res: Response, next: NextFunction) => {
    // org OWNER/ADMIN bypass domain checks too
    if (req.projectAccessContext?.orgRole !== 'MEMBER' || req.projectAccessContext?.effectiveRole !== 'ADMIN') {
      next()
      return
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.projectAccessContext.projectId,
          userId: req.userAccessContext!.userId,
        }
      },
      include: {
        permissions: {
          where: { domain }
        }
      }
    })

    const permission = membership?.permissions[0]

    if (!permission || hierarchy[permission.accessLevel] < hierarchy[minimum]) {
      res.status(403).json({ success: false, message: `Requires ${domain} ${minimum} access.`, code: "FORBIDDEN" })
      return
    }
    next()
  }
}