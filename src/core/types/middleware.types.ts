import { Organization, OrganizationRole, Project, ProjectRole, User } from "@/generated/prisma/client";
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

export interface ProjectAccessContext {
  project: Project;
  projectId: string;
  organizationId: string;
  orgRole: OrganizationRole;
  projectRole: ProjectRole | null;
  effectiveRole: ProjectRole;  
}

export interface OrganizationAccessContext {
  organizationId: string;
  organization: Organization;
  orgRole: OrganizationRole;
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
