import { Request, Response } from "express";
import { ProjectContext } from "./project.types";
import { addProjectMember, deleteProjectMember, getProject, getProjectMembers, updateProjectMember } from "./project.services";
import { addProjectMemberSchema, removeProjectMemberParamSchema, updateProjectMemberParamSchema, updateProjectMemberSchema, updateProjectSchema } from "./project.validations";
import {z} from "zod";
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
