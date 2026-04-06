import { Organization, Project, User } from "@/generated/prisma/client";
import { EffectiveRole } from "../rbac/rbac";
import express from "express";

export interface JwtAccessPayload {
  sub: string; // userId
  jti: string; // sessionId
  iat?: number;
  exp?: number;
}
export interface UserAccessContext {
  userId: string;
  sessionId: string;
  user?: User;
}

interface ProjectAccessContext {
  project: Project;
  projectId: string;
  effectiveRole: EffectiveRole;  
  organizationId: string;
}

interface OrganizationAccessContext {
  organizationId: string;
  organization: Organization;
  effectiveRole: EffectiveRole;
}
export type OrgRequest =  express.Request & {
  userAccessContext?: UserAccessContext;
  organizationAccessContext?: OrganizationAccessContext;
};

export type ProjectRequest = express.Request & {
  userAccessContext?: UserAccessContext;
  projectAccessContext?: ProjectAccessContext;
};
// Augment Express Request so downstream handlers get typed access
declare global {
  namespace Express {
    interface Request {
      userAccessContext?: UserAccessContext;
      projectAccessContext?: ProjectAccessContext;
      organizationAccessContext?: OrganizationAccessContext;
    }
  }
}
