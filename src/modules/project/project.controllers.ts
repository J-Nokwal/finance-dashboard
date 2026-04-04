import { Request, Response } from "express";

// Project
export const getProject = async (req: Request, res: Response): Promise<void> => {};

export const updateProject = async (req: Request, res: Response): Promise<void> => {};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {};

// Project Members
export const listProjectMembers = async (req: Request, res: Response): Promise<void> => {};

export const addProjectMember = async (req: Request, res: Response): Promise<void> => {};

export const updateProjectMember = async (req: Request, res: Response): Promise<void> => {};

export const removeProjectMember = async (req: Request, res: Response): Promise<void> => {};

// Project Analytics/Dashboard
export const getProjectSummary = async (req: Request, res: Response): Promise<void> => {};

export const getProjectActivity = async (req: Request, res: Response): Promise<void> => {};

export const getProjectStats = async (req: Request, res: Response): Promise<void> => {};