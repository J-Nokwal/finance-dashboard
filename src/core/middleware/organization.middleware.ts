import { Response, NextFunction } from "express";
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

  if (!orgId || typeof orgId !== "string") {
    res.status(400).json({
      success: false,
      message: "Organization ID is required and must be a string.",
      code: "ORG_ID_INVALID",
    });
    return;
  }

  const orgMembership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId }},
    include: { organization: true },
  });

  if (!orgMembership || orgMembership.organization.deletedAt) {
    res.status(404).json({
      success: false,
      message: "Organization not found.",
      code: "ORG_NOT_FOUND",
    });
    return;
  }

  req.organizationAccessContext = {
    organizationId: orgId,
    organization: orgMembership.organization,
    orgRole: orgMembership.organizationRole,
  };
  next();
}