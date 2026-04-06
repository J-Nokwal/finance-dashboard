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
import { requireAuth, requireSession } from "@/src/core/middleware/auth.middleware";

const router = Router(); // Base: /projects

// Project
router.get("/:projectId", requireAuth,getProject);           // Get project details
router.patch("/:projectId", requireAuth,requireSession,updateProject);      // Update project information
router.delete("/:projectId", requireAuth,requireSession,deleteProject);     // Delete a project (soft delete preferred)

// Project Members
router.get("/:projectId/members", requireAuth,listProjectMembers);                  // List members of a project
router.post("/:projectId/members", requireAuth,addProjectMember);                   // Add a member to the project
router.patch("/:projectId/members/:userId", requireAuth,requireSession,updateProjectMember);       // Update member information (e.g., role)
router.delete("/:projectId/members/:userId", requireAuth,requireSession,removeProjectMember);      // Remove a member from the project

// Project Analytics/Dashboard
router.get("/:projectId/summary", requireAuth,getProjectSummary);   // Get summary of project financials and key metrics
router.get("/:projectId/activity",requireAuth, getProjectActivity); // Get recent activity and changes in the project
router.get("/:projectId/stats", requireAuth,getProjectStats);       // Get detailed statistics

export default router;