import { Router } from "express";
import {
  getProject,
  updateProject,
  deleteProject,
  listProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  getProjectSummary,
  getProjectActivity,
  getProjectStats,
} from "./project.controllers";
import {
  requireAuth,
  requireSession,
} from "@/src/core/middleware/auth.middleware";
import { loadProjectAccessContext } from "@/src/core/middleware/project.middleware";
import { requireProjectRole } from "@/src/core/middleware/rbac.middleware";
import { ProjectRole } from "@/generated/prisma/enums";

const router = Router(); // Base: /projects

// Project
router.get("/:projectId", requireAuth, loadProjectAccessContext, getProject); // Get project details
router.patch(
  "/:projectId",
  requireAuth,
  requireSession,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  updateProject,
); // Update project information

// Project Members
router.get(
  "/:projectId/members",
  requireAuth,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.MEMBER),
  listProjectMembers,
); // List members of a project
router.post(
  "/:projectId/members",
  requireAuth,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  addProjectMember,
); // Add a member to the project
router.patch(
  "/:projectId/members/:userId",
  requireAuth,
  requireSession,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  updateProjectMember,
); // Update member information (e.g., role)
router.delete(
  "/:projectId/members/:userId",
  requireAuth,
  requireSession,
  loadProjectAccessContext,
  requireProjectRole(ProjectRole.ADMIN),
  removeProjectMember,
); // Remove a member from the project

// Project Analytics/Dashboard
router.get(
  "/:projectId/summary",
  requireAuth,
  loadProjectAccessContext,
  getProjectSummary,
); // Get summary of project financials and key metrics
router.get(
  "/:projectId/activity",
  requireAuth,
  loadProjectAccessContext,
  getProjectActivity,
); // Get recent activity and changes in the project
router.get(
  "/:projectId/stats",
  requireAuth,
  loadProjectAccessContext,
  getProjectStats,
); // Get detailed statistics

export default router;
