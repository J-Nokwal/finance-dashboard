import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { getEffectiveRole } from "../rbac/resolver";

// function loadProjectAccessContext
async function loadProjectAccessContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.userId;
  const { projectId } = req.params;
  if (projectId && typeof projectId !== "string") {
    res.status(400).json({
      success: false,
      message: "Project ID must be a string.",
      code: "PROJECT_ID_INVALID",
    });
    return;
  }
  if (!projectId) {
    res.status(400).json({
      success: false,
      message: "Project ID is required in the URL.",
      code: "PROJECT_ID_REQUIRED",
    });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    res.status(404).json({
      success: false,
      message: "Project not found.",
      code: "PROJECT_NOT_FOUND",
    });
    return;
  }

  const orgMembership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: project.organizationId,
      },
    },
  });
  const projectMembership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        userId,
        projectId,
      },
    },
  });

  if (!orgMembership || !projectMembership) {
    res.status(403).json({
      success: false,
      message: "You do not have access to this project.",
      code: "PROJECT_ACCESS_FORBIDDEN",
    });
    return;
  }

  const effectiveRole = getEffectiveRole(
    orgMembership.organizationRole,
    projectMembership.projectRole,
  );

  req.project = project;
  req.projectId = projectId;
  req.organizationId = project.organizationId;
  req.effectiveRole = effectiveRole;

  next();
}
