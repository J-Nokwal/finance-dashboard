import { OrganizationRole, ProjectRole } from "../../../generated/prisma/enums";
export type EffectiveRole = ProjectRole | OrganizationRole | "NONE";

export const rolePriority: Record<EffectiveRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  ANALYST: 3,
  VIEWER: 2,
  MEMBER: 1,
  NONE: 0,
};
