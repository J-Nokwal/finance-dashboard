import { ProjectAccessContext, UserAccessContext } from "../../core/types/middleware.types";

export type ProjectContext = {
    userAccessContext: UserAccessContext;
    projectAccessContext: ProjectAccessContext;
};