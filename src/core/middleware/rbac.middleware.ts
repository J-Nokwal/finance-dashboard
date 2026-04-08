import { Request,Response, NextFunction } from "express";
import { OrganizationRole, ProjectRole } from "@/generated/prisma/enums";

export function requireProjectRole(minimum: ProjectRole) {
  const hierarchy: Record<ProjectRole, number> = {
    ADMIN:   2,
    MEMBER: 1,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const effectiveRole = req.projectAccessContext?.effectiveRole;

    if (!effectiveRole) {
      res.status(403).json({ success: false, message: "No project access.", code: "PROJECT_ACCESS_FORBIDDEN" });
      return;
    }

    if (hierarchy[effectiveRole] >= hierarchy[minimum]) {
      next();
      return;
    }

    res.status(403).json({ success: false, message: "Insufficient permissions.", code: "FORBIDDEN" });
  };
}

export function requireOrgRole(minimum: OrganizationRole) {
  const hierarchy: Record<OrganizationRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    MEMBER: 1,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const orgRole = req.organizationAccessContext?.orgRole;

    if (!orgRole) {
      res.status(403).json({ success: false, message: "No org access.", code: "ORG_ACCESS_FORBIDDEN" });
      return;
    }

    if (hierarchy[orgRole] >= hierarchy[minimum]) {
      next();
      return;
    }

    res.status(403).json({ success: false, message: "Insufficient permissions.", code: "FORBIDDEN" });
  };
}