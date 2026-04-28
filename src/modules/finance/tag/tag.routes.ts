import { Router } from "express";
import { DomainAccess, ProjectDomain } from "../../../../generated/prisma/enums";
import { requireAuth } from "../../../../src/core/middleware/auth.middleware";
import { loadProjectAccessContext, requireDomainAccess } from "../../../../src/core/middleware/project.middleware";
import { deleteTagController, getTagsController, postTagController, updateTagController } from "./tag.controllers";

const router = Router(); // Base: /projects/:projectId/finance/tags

router.post(
    "/",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.WRITE),
    postTagController
)
router.get(
    "/",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.READ),
    getTagsController
)
router.patch(
    "/:tagId",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.WRITE),
    updateTagController
)
router.delete(
    "/:tagId",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.MANAGE),
    deleteTagController
)

export default router;