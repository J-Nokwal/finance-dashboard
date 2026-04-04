import { Request, Response, NextFunction } from "express";
import { EffectiveRole, rolePriority } from "../rbac/rbac";

export function requireRole(allowedRoles: EffectiveRole | EffectiveRole[]) {
  return (req: Request,
    res: Response,
    next: NextFunction,) => {
    const userRole = req.effectiveRole;

    if (!userRole) {
      return res.status(403).json({ message: "No role found" });
    }
    const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    const hasAccess = allowedRolesArray.some(
      (role) => rolePriority[userRole] >= rolePriority[role]
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}