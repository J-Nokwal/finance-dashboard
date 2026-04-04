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

const router = Router(); // Base: /projects

// Project
router.get("/:projectId", getProject);           // Get project details
router.patch("/:projectId", updateProject);      // Update project information
router.delete("/:projectId", deleteProject);     // Delete a project (soft delete preferred)

// Project Members
router.get("/:projectId/members", listProjectMembers);                  // List members of a project
router.post("/:projectId/members", addProjectMember);                   // Add a member to the project
router.patch("/:projectId/members/:userId", updateProjectMember);       // Update member information (e.g., role)
router.delete("/:projectId/members/:userId", removeProjectMember);      // Remove a member from the project

// Project Analytics/Dashboard
router.get("/:projectId/summary", getProjectSummary);   // Get summary of project financials and key metrics
router.get("/:projectId/activity", getProjectActivity); // Get recent activity and changes in the project
router.get("/:projectId/stats", getProjectStats);       // Get detailed statistics

export default router;