import { Router } from "express";
import {
  getProjectController,
  updateProjectController,
  listProjectMembersController,
  addProjectMemberController,
  updateProjectMemberController,
  removeProjectMemberController,
  // getProjectSummaryController,
  // getProjectActivityController,
  // getProjectStatsController,
} from "./project.controllers";
import {
  requireAuth,
  requireSession,
} from "../../../src/core/middleware/auth.middleware";
import { loadProjectAccessContext } from "../../../src/core/middleware/project.middleware";
import { requireProjectRole } from "../../../src/core/middleware/rbac.middleware";
import { ProjectRole } from "../../../generated/prisma/enums";

const router = Router(); // Base: /projects

// Project
router.get("/:projectId", requireAuth, loadProjectAccessContext, getProjectController); // Get project details
router.patch(
  "/:projectId",
  requireAuth,
  requireSession,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  updateProjectController,
); // Update project information

// Project Members
router.get(
  "/:projectId/members",
  requireAuth,
  loadProjectAccessContext,
  listProjectMembersController,
); // List members of a project-All members of project can get the list
router.post(
  "/:projectId/members",
  requireAuth,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  addProjectMemberController,
); // Add a member to the project
router.patch(
  "/:projectId/members/:userId",
  requireAuth,
  requireSession,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  updateProjectMemberController,
); // Update member information (e.g., role)
router.delete(
  "/:projectId/members/:userId",
  requireAuth,
  requireSession,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  removeProjectMemberController,
); // Remove a member from the project

// // Project Analytics/Dashboard
// router.get(
//   "/:projectId/summary",
//   requireAuth,
//   loadProjectAccessContext,
//   getProjectSummaryController,
// ); // Get summary of project financials and key metrics
// router.get(
//   "/:projectId/activity",
//   requireAuth,
//   loadProjectAccessContext,
//   getProjectActivityController,
// ); // Get recent activity and changes in the project
// router.get(
//   "/:projectId/stats",
//   requireAuth,
//   loadProjectAccessContext,
//   getProjectStatsController,
// ); // Get detailed statistics

export default router;
