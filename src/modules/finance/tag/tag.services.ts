import prisma from "../../../../src/core/config/prisma";
import { FinanceContext } from "../finance.types";
import { normalizeTagName } from "../../../../src/utils/helpers";

export async function createTag(
  name: string,
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;
  const normalized = normalizeTagName(name);

  const existingTag = await prisma.financialRecordTag.findUnique({
    where: {
      name_projectId: {
        name: normalized,
        projectId,
      },
    },
  });

  if (existingTag) {
    throw new Error("Tag already exists");
  }

  return prisma.financialRecordTag.create({
    data: {
      name: normalized,
      projectId,
    },
  });
}

export async function getTags(
  query: { name?: string },
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;

  return prisma.financialRecordTag.findMany({
    where: {
      projectId,
      ...(query.name
        ? {
            name: {
              contains: query.name,
              mode: "insensitive",
            },
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function updateTag(
  tagId: string,
  name: string,
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;
  const normalized = normalizeTagName(name);

  const existingTag = await prisma.financialRecordTag.findFirst({
    where: {
      id: tagId,
      projectId,
    },
  });

  if (!existingTag) {
    throw new Error("Tag not found");
  }

  const duplicateTag = await prisma.financialRecordTag.findUnique({
    where: {
      name_projectId: {
        name: normalized,
        projectId,
      },
    },
  });

  if (duplicateTag && duplicateTag.id !== tagId) {
    throw new Error("Tag name already exists");
  }

  return prisma.financialRecordTag.update({
    where: { id: tagId },
    data: { name: normalized },
  });
}

export async function deleteTag(
  tagId: string,
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;

  const existingTag = await prisma.financialRecordTag.findFirst({
    where: {
      id: tagId,
      projectId,
    },
  });

  if (!existingTag) {
    throw new Error("Tag not found");
  }

  await prisma.financialRecordTag.delete({
    where: { id: tagId },
  });

  return { success: true };
}
