import prisma from "../../../../src/core/config/prisma";
import { Decimal } from "@prisma/client/runtime/client";
import {
  FinanceContext,
  FinanceRecordCreatePayload,
  FinanceRecordUpdatePayload,
  FinanceRecordWithCategoryTags,
  GetRecordsParams,
} from "../finance.types";
import { convertCurrency, normalizeTagName } from "../../../../src/utils/helpers";
import { Prisma } from "../../../../generated/prisma/browser";

export async function postRecord(
  record: FinanceRecordCreatePayload,
  financeContext: FinanceContext,
): Promise<FinanceRecordWithCategoryTags> {
  const userId = financeContext.userAccessContext.userId;
  const projectId = financeContext.projectAccessContext.projectId;
  const baseCurrency = financeContext.projectAccessContext.project.baseCurrency;

  const existingCategory = await prisma.financialRecordCategory.findFirst({
    where: {
      id: record.categoryId,
      projectId,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const tagConnections: { tagId: string }[] = [];

  if (record.tags?.length) {
    for (const t of record.tags) {
      if (t.tagId) {
        const existingTag = await prisma.financialRecordTag.findFirst({
          where: {
            id: t.tagId,
            projectId,
          },
        });
        if (!existingTag) {
          throw new Error("Tag not found");
        }
        tagConnections.push({ tagId: t.tagId });
        continue;
      }

      if (t.name) {
        const normalizedName = normalizeTagName(t.name);
        const tag = await prisma.financialRecordTag.upsert({
          where: {
            name_projectId: {
              name: normalizedName,
              projectId,
            },
          },
          create: {
            name: normalizedName,
            projectId,
          },
          update: {},
        });
        tagConnections.push({ tagId: tag.id });
      }
    }
  }

  const currency = record.currency ?? "INR";
  const { baseAmount, exchangeRate } = await convertCurrency(
    record.amount,
    currency,
    baseCurrency,
  );

  const newRecord = await prisma.financialRecord.create({
    data: {
      amount: record.amount,
      type: record.type,
      date: record.date,
      categoryId: record.categoryId,
      source: record.source ?? undefined,
      description: record.description ?? undefined,
      currency: record.currency ?? "INR",
      baseAmount,
      baseCurrency,
      exchangeRate,
      projectId,
      createdByUserId: userId,
      tags: tagConnections.length
        ? {
            create: tagConnections,
          }
        : undefined,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      category: true,
    },
  });

  return newRecord;
}

export async function getRecords(
  params: GetRecordsParams,
  financeContext: FinanceContext,
) {
  if (params.projectId !== financeContext.projectAccessContext.projectId) {
    throw new Error("Unauthorized");
  }

  const safeLimit = Math.min(params.limit ?? 20, 1000);
  const isNext = params.direction !== "prev";

  const cursorData: { date: Date; id: string } | undefined = params.cursor
    ? decodeCursor(params.cursor)
    : undefined;

  const where: Prisma.FinancialRecordWhereInput = {
    projectId: params.projectId,
    deletedAt: null,
    ...(params.type && { type: params.type }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.source && { source: params.source }),
    ...(params.fromDate || params.toDate
      ? {
          date: {
            ...(params.fromDate && { gte: params.fromDate }),
            ...(params.toDate && { lte: params.toDate }),
          },
        }
      : {}),
    ...(params.tags?.length
      ? {
          tags: {
            some: {
              tagId: { in: params.tags },
            },
          },
        }
      : {}),
  };

  const orderBy:
    | Prisma.FinancialRecordOrderByWithRelationInput
    | Prisma.FinancialRecordOrderByWithRelationInput[] = [
    { date: isNext ? "desc" : "asc" },
    { id: isNext ? "desc" : "asc" },
  ];

  const cursorCondition: Prisma.FinancialRecordWhereUniqueInput | undefined =
    cursorData != null
      ? {
          date_id: {
            date: cursorData.date,
            id: cursorData.id,
          },
        }
      : undefined;

  const records = await prisma.financialRecord.findMany({
    where,
    orderBy,
    take: isNext ? safeLimit + 1 : -(safeLimit + 1),
    ...(cursorData && {
      cursor: cursorCondition,
      skip: 1,
    }),
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  let finalRecords = records;

  if (!isNext) {
    finalRecords = records.reverse();
  }

  const hasMore = finalRecords.length > safeLimit;

  if (hasMore) {
    finalRecords.pop();
  }

  const nextCursorData =
    finalRecords.length > 0
      ? {
          date: finalRecords[finalRecords.length - 1].date,
          id: finalRecords[finalRecords.length - 1].id,
        }
      : null;

  const prevCursorData =
    finalRecords.length > 0
      ? {
          date: finalRecords[0].date,
          id: finalRecords[0].id,
        }
      : null;

  return {
    data: finalRecords,
    pageInfo: {
      hasNext: isNext ? hasMore : true,
      hasPrev: isNext ? true : hasMore,
      nextCursor: nextCursorData ? encodeCursor(nextCursorData) : undefined,
      prevCursor: prevCursorData ? encodeCursor(prevCursorData) : undefined,
    },
  };
}

export async function getRecord(
  recordId: string,
  financeContext: FinanceContext,
): Promise<FinanceRecordWithCategoryTags> {
  const record = await prisma.financialRecord.findFirst({
    where: {
      id: recordId,
      projectId: financeContext.projectAccessContext.projectId,
      deletedAt: null,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!record) {
    throw new Error("Record not found");
  }
  return record;
}

export async function updateRecord(
  recordId: string,
  data: FinanceRecordUpdatePayload,
  financeContext: FinanceContext,
): Promise<FinanceRecordWithCategoryTags> {
  const projectId = financeContext.projectAccessContext.projectId;
  const baseCurrency = financeContext.projectAccessContext.project.baseCurrency;

  const existingRecord = await prisma.financialRecord.findFirst({
    where: {
      id: recordId,
      projectId,
      deletedAt: null,
    },
  });

  if (!existingRecord) {
    throw new Error("Record not found");
  }

  if (data.categoryId) {
    const existingCategory = await prisma.financialRecordCategory.findFirst({
      where: {
        id: data.categoryId,
        projectId,
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }
  }

  let baseAmount: number | Decimal = existingRecord.baseAmount;
  let exchangeRate: number | Decimal = existingRecord.exchangeRate;

  if (data.amount !== undefined || data.currency !== undefined) {
    const amount = data.amount ?? Number(existingRecord.amount);
    const currency = data.currency ?? existingRecord.currency;

    const conversion = await convertCurrency(amount, currency, baseCurrency);
    baseAmount = conversion.baseAmount;
    exchangeRate = conversion.exchangeRate;
  }

  const tagConnections: { tagId: string }[] = [];

  if (data.tags) {
    for (const t of data.tags) {
      if (t.tagId) {
        const existingTag = await prisma.financialRecordTag.findFirst({
          where: {
            id: t.tagId,
            projectId,
          },
        });
        if (!existingTag) {
          throw new Error("Tag not found");
        }
        tagConnections.push({ tagId: t.tagId });
        continue;
      }

      if (t.name) {
        const normalizedName = normalizeTagName(t.name);
        const tag = await prisma.financialRecordTag.upsert({
          where: {
            name_projectId: {
              name: normalizedName,
              projectId,
            },
          },
          create: {
            name: normalizedName,
            projectId,
          },
          update: {},
        });
        tagConnections.push({ tagId: tag.id });
      }
    }
  }

  const updatedRecord = await prisma.$transaction(async (tx) => {
    if (data.tags) {
      await tx.financialRecordTagMap.deleteMany({
        where: { recordId },
      });
    }

    const record = await tx.financialRecord.update({
      where: { id: recordId },
      data: {
        amount: data.amount ?? undefined,
        type: data.type ?? undefined,
        date: data.date ?? undefined,
        categoryId: data.categoryId ?? undefined,
        source: data.source ?? undefined,
        description: data.description ?? undefined,
        currency: data.currency ?? undefined,
        baseAmount,
        baseCurrency,
        exchangeRate,
        tags: data.tags
          ? {
              create: tagConnections,
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        category: true,
      },
    });

    return record;
  });

  return updatedRecord;
}

export async function deleteRecord(
  recordId: string,
  financeContext: FinanceContext,
): Promise<{ success: boolean }> {
  const projectId = financeContext.projectAccessContext.projectId;

  const existingRecord = await prisma.financialRecord.findFirst({
    where: {
      id: recordId,
      projectId,
      deletedAt: null,
    },
  });

  if (!existingRecord) {
    throw new Error("Record not found or already deleted");
  }

  await prisma.financialRecord.update({
    where: { id: recordId },
    data: {
      deletedAt: new Date(),
    },
  });

  return { success: true };
}

function encodeCursor(cursor: { date: Date; id: string }): string {
  return Buffer.from(
    JSON.stringify({
      date: cursor.date.toISOString(),
      id: cursor.id,
    }),
  ).toString("base64");
}

function decodeCursor(cursor: string): {
  date: Date;
  id: string;
} {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));

    return {
      date: new Date(decoded.date),
      id: decoded.id,
    };
  } catch {
    throw new Error("Invalid cursor");
  }
}
