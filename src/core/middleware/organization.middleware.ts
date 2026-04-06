import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { OrgRequest } from "../types/middleware.types";
export async function loadOrganizationAccessContext(
  req: OrgRequest,
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
  const { orgId } = req.params;
  if (orgId && typeof orgId !== "string") {
    res.status(400).json({
      success: false,
      message: "Organization ID must be a string.",
      code: "ORG_ID_INVALID",
    });
    return;
  }
  if (!orgId) {
    res.status(400).json({
      success: false,
      message: "Organization ID is required in the URL.",
      code: "ORG_ID_REQUIRED",
    });
    return;
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org) {
    res.status(404).json({
      success: false,
      message: "Organization not found.",
      code: "ORG_NOT_FOUND",
    });
    return;
  }

  const orgMembership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: orgId,
      },
    },
  });

  if (!orgMembership) {
    res.status(403).json({
      success: false,
      message: "You are not a member of this organization.",
      code: "NOT_ORG_MEMBER",
    });
    return;
  }
  req.organizationAccessContext = {
    organizationId: orgId,
    organization: org,
    effectiveRole: orgMembership.organizationRole,
  }
  next();
}
