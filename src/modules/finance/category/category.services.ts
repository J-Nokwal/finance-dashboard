import prisma from "@/src/core/config/prisma";
import { FinanceContext } from "../finance.types";
import { RecordType } from "@/generated/prisma/enums";

export async function createCategory(
  data: { name: string; type: RecordType },
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;
  const name = data.name.trim();

  const existingCategory = await prisma.financialRecordCategory.findUnique({
    where: {
      name_projectId: {
        name,
        projectId,
      },
    },
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  return prisma.financialRecordCategory.create({
    data: {
      name,
      type: data.type,
      projectId,
    },
  });
}

export async function getCategories(
  query: { name?: string; type?: RecordType },
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;

  return prisma.financialRecordCategory.findMany({
    where: {
      projectId,
      ...(query.type && { type: query.type }),
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

export async function updateCategory(
  categoryId: string,
  data: { name?: string; type?: RecordType },
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;

  const existingCategory = await prisma.financialRecordCategory.findFirst({
    where: {
      id: categoryId,
      projectId,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  if (data.name) {
    const duplicateCategory = await prisma.financialRecordCategory.findUnique({
      where: {
        name_projectId: {
          name: data.name.trim(),
          projectId,
        },
      },
    });

    if (duplicateCategory && duplicateCategory.id !== categoryId) {
      throw new Error("Category name already exists");
    }
  }

  return prisma.financialRecordCategory.update({
    where: { id: categoryId },
    data: {
      name: data.name?.trim() ?? undefined,
      type: data.type ?? undefined,
    },
  });
}

export async function deleteCategory(
  categoryId: string,
  financeContext: FinanceContext,
) {
  const projectId = financeContext.projectAccessContext.projectId;

  const existingCategory = await prisma.financialRecordCategory.findFirst({
    where: {
      id: categoryId,
      projectId,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const existingRecords = await prisma.financialRecord.count({
    where: {
      categoryId,
      projectId,
      deletedAt: null,
    },
  });

  if (existingRecords > 0) {
    throw new Error("Cannot delete category with attached records");
  }

  await prisma.financialRecordCategory.delete({
    where: { id: categoryId },
  });

  return { success: true };
}
