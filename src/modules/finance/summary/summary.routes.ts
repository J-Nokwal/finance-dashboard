import { Router } from "express";
import { DomainAccess, ProjectDomain } from "@/generated/prisma/enums";
import { requireAuth } from "@/src/core/middleware/auth.middleware";
import { loadProjectAccessContext, requireDomainAccess } from "@/src/core/middleware/project.middleware";

const router = Router(); // Base: /projects/:projectId/finance/summary

router.get(
    "/",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
)

router.get(
    "/category-breakdown",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
)

router.get(
    "/trends",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
)

router.get(
    "/recent",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
)

export default router;