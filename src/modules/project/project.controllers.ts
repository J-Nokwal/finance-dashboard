import { Request, Response } from "express";
import { ProjectContext } from "./project.types";
import { addProjectMember, deleteProjectMember, getProject, getProjectMembers, updateProjectMember } from "./project.services";
import { addProjectMemberSchema, removeProjectMemberParamSchema, updateProjectMemberParamSchema, updateProjectMemberSchema, updateProjectSchema } from "./project.validations";
import {z} from "zod";
/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get project details
 *     description: Retrieve the details of a single project.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
// Project
export const getProjectController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectContext: ProjectContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
  const project = await getProject(projectContext);
  res.status(200).json(project);
};

/**
 * @swagger
 * /api/projects/{projectId}:
 *   patch:
 *     summary: Update project
 *     description: Update project information such as name. Requires ADMIN access.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Project Name"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export const updateProjectController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectContext: ProjectContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
  const bodyResult = updateProjectSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }
  const project = await getProject(projectContext);
  res.status(200).json(project);
};

// Project Members
/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   get:
 *     summary: List project members
 *     description: Retrieve all members assigned to a project.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     responses:
 *       200:
 *         description: List of project members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                   projectRole:
 *                     type: string
 *                   projectPermissions:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const listProjectMembersController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectContext: ProjectContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
  const members = await getProjectMembers(projectContext);
  res.status(200).json(members);

};

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   post:
 *     summary: Add project member
 *     description: Add a new member to a project. Requires ADMIN access.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - projectRole
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               projectRole:
 *                 type: string
 *               projectPermissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 projectRole:
 *                   type: string
 *                 projectPermissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       500:
 *         description: Server error
 */
export const addProjectMemberController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectContext: ProjectContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
  const bodyResult = addProjectMemberSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }
  const member = await addProjectMember(
    bodyResult.data.userId,
    bodyResult.data.projectRole,
    bodyResult.data.projectPermissions,
    projectContext
  )
  res.status(200).json(member);
};

/**
 * @swagger
 * /api/projects/{projectId}/members/{userId}:
 *   patch:
 *     summary: Update project member
 *     description: Update an existing project member's role or permissions. Requires ADMIN access.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - projectRole
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               projectRole:
 *                 type: string
 *               projectPermissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 projectRole:
 *                   type: string
 *                 projectPermissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
export const updateProjectMemberController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectContext: ProjectContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
  const paramsResult = updateProjectMemberParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
  const bodyResult = updateProjectMemberSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }
  if (bodyResult.data.userId !== paramsResult.data.userId) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }
  const member = await updateProjectMember(
    bodyResult.data.userId,
    bodyResult.data.projectRole,
    bodyResult.data.projectPermissions,
    projectContext
  )
  res.status(200).json(member);
};

/**
 * @swagger
 * /api/projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: Remove project member
 *     description: Remove a member from a project. Requires ADMIN access.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Member removed successfully"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
export const removeProjectMemberController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectContext: ProjectContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
  const paramsResult = removeProjectMemberParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
   await deleteProjectMember(
    paramsResult.data.userId,
    projectContext
  )
  res.status(200);
};

// // Project Analytics/Dashboard
// export const getProjectSummaryController = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   const projectContext: ProjectContext = {
//     projectAccessContext: req.projectAccessContext!,
//     userAccessContext: req.userAccessContext!,
//   };
// };

// export const getProjectActivityController = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   const projectContext: ProjectContext = {
//     projectAccessContext: req.projectAccessContext!,
//     userAccessContext: req.userAccessContext!,
//   };
// };

// export const getProjectStatsController = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   const projectContext: ProjectContext = {
//     projectAccessContext: req.projectAccessContext!,
//     userAccessContext: req.userAccessContext!,
//   };
// };
