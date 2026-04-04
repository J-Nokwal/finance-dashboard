// function getEffectiveRole

import { OrganizationRole, ProjectRole } from "@/generated/prisma/enums";
import prisma from "../config/prisma";
import { EffectiveRole, rolePriority } from "./rbac";



export function getEffectiveRole(orgRole: OrganizationRole, projRole: ProjectRole): EffectiveRole {
    if (!projRole) return orgRole
    return rolePriority[orgRole] > rolePriority[projRole]
    ? orgRole
    : projRole
}