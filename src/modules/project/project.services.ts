import prisma from "@/src/core/config/prisma";
import { ProjectContext } from "./project.types";

export async function getProject(projectContext: ProjectContext) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectContext.projectAccessContext.projectId,
    },
  });
  return project;
}

export async function updateProject(projectContext: ProjectContext) {
  const project = await prisma.project.update({
    where: {
      id: projectContext.projectAccessContext.projectId,
    },
    data: {
      name: projectContext.projectAccessContext.project.name,
    },
  });
  return project;
}

export async function deleteProject(projectContext: ProjectContext) {
  const project = await prisma.project.delete({
    where: {
      id: projectContext.projectAccessContext.projectId,
    },
  });
  return project;
}