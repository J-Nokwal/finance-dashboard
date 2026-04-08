import { OrganizationRole, ProjectRole } from "@/generated/prisma/enums";

// - What can this user DO inside a project?
export function getEffectiveProjectRole(
  orgRole: OrganizationRole,
  projectRole: ProjectRole | null,
): ProjectRole | null {
  if (orgRole === "OWNER" || orgRole === "ADMIN") return "ADMIN";
  return projectRole ?? null;
}

// - Can this user MANAGE a specific project role?
export function canManageProjectRole(
  actorOrgRole: OrganizationRole,
  actorProjectRole: ProjectRole | null,
  targetRole: ProjectRole,
): boolean {
  if (actorOrgRole === "OWNER" || actorOrgRole === "ADMIN") return true;
  if (actorProjectRole === "ADMIN") {
    return targetRole !== "ADMIN";
  }
  return false;
}

export function canManageOrgRole(
  actorOrgRole: OrganizationRole,
  targetRole: OrganizationRole,
): boolean {
  if (targetRole === "OWNER") return false;
  if (actorOrgRole === "OWNER") return true;
  return actorOrgRole === "ADMIN" && targetRole !== "ADMIN";
}