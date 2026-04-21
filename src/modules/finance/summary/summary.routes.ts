import { Router } from "express";
import { DomainAccess, ProjectDomain } from "@/generated/prisma/enums";
import { requireAuth } from "@/src/core/middleware/auth.middleware";
import { loadProjectAccessContext, requireDomainAccess } from "@/src/core/middleware/project.middleware";
import {
  getCategoryBreakdownController,
  getRecentRecordsController,
  getSummaryController,
  getTrendController,
} from "./summary.controllers";

const router = Router(); // Base: /projects/:projectId/finance/summary

router.get(
  "/",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
  getSummaryController,
);

router.get(
  "/category-breakdown",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
  getCategoryBreakdownController,
);

router.get(
  "/trends",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
  getTrendController,
);

router.get(
  "/recent",
  requireAuth,
  loadProjectAccessContext,
  requireDomainAccess(ProjectDomain.DASHBOARD, DomainAccess.READ),
  getRecentRecordsController,
);

export default router;
