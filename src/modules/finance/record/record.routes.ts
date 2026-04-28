import { Router } from "express";
import {
  requireAuth,
  requireSession,
} from "../../../../src/core/middleware/auth.middleware";
import {
  loadProjectAccessContext,
  requireDomainAccess,
} from "../../../../src/core/middleware/project.middleware";
import {
  DomainAccess,
  ProjectDomain,
  ProjectRole,
} from "../../../../generated/prisma/enums";
import {
  postRecordController,
  deleteRecordController,
  getRecordController,
  getRecordsController,
  updateRecordController,
} from "./record.controllers";

const router = Router(); // Base: /projects/:projectId/finance/records

router.post(
  "/",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.WRITE),
  postRecordController,
);

router.get(
  "/",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.READ),
  getRecordsController,
);

router.get(
  "/:recordId",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.READ),
  getRecordController,
);

router.patch(
  "/:recordId",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.WRITE),
  updateRecordController,
);

router.delete(
  "/:recordId",
  requireAuth,
  requireSession,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.FINANCE, DomainAccess.MANAGE),
  deleteRecordController,
);
export default router;
