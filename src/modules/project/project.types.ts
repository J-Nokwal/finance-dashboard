import { ProjectAccessContext, UserAccessContext } from "@/src/core/types/middleware.types";

export type ProjectContext = {
    userAccessContext: UserAccessContext;
    projectAccessContext: ProjectAccessContext;
};