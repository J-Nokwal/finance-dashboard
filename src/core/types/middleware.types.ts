import { Project, User } from "@/generated/prisma/client";
import { EffectiveRole } from "../rbac/rbac";

export interface JwtAccessPayload {
  sub: string;       // userId
  jti: string;      // sessionId 
  iat?: number;
  exp?: number;
}

// Augment Express Request so downstream handlers get typed access
declare global {
  namespace Express {
    interface Request {
      userId: string;
      sessionId: string;
      user?: User;
      project?: Project;
      projectId?: string;
      organizationId?: string;
      effectiveRole?: EffectiveRole;
    }
  }
}
