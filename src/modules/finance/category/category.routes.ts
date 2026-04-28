import { DomainAccess, ProjectDomain } from "../../../../generated/prisma/enums";
import { requireAuth } from "../../../../src/core/middleware/auth.middleware";
import { loadProjectAccessContext, requireDomainAccess } from "../../../../src/core/middleware/project.middleware";
import { Router } from "express";
import { deleteCategoryController, getCategoriesController, postCategoryController, updateCategoryController } from "./category.controllers";

const router = Router(); // Base: /projects/:projectId/finance/categories



router.post(
    "/",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.WRITE),
    postCategoryController,
)
router.get(
    "/",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.READ),
    getCategoriesController
)
router.patch(
    "/:categoryId",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.WRITE),
    updateCategoryController
)
router.delete(
    "/:categoryId",
    requireAuth,
    loadProjectAccessContext,
    requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.MANAGE),
    deleteCategoryController
)


export default router;