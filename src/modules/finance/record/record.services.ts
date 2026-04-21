import prisma from "@/src/core/config/prisma";
import {
  FinanceContext,
  FinanceRecordWithCategoryTags,
  GetRecordsParams,
} from "../finance.types";
import { convertCurrency, normalizeTagName } from "@/src/utils/helpers";
import { Prisma } from "@/generated/prisma/browser";
import { Decimal } from "@prisma/client/runtime/client";

export async function postRecord(
  record: FinanceRecordWithCategoryTags,
  financeContext: FinanceContext,
): Promise<FinanceRecordWithCategoryTags> {
  const userId = financeContext.userAccessContext.userId;
  const projectId = financeContext.projectAccessContext.projectId;
  const tagConnections: { tagId: string }[] = [];
  const baseCurrency = financeContext.projectAccessContext.project.baseCurrency;
  const { baseAmount, exchangeRate } = await convertCurrency(
    record.amount.toNumber(),
    record.currency,
    baseCurrency,
  );

  const existingCategory = await prisma.financialRecordCategory.findUnique({
    where: {
      id: record.categoryId,
      projectId: projectId,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  if (record.tags?.length) {
    for (const t of record.tags) {
      if (t.tag?.id) {
        tagConnections.push({ tagId: t.tag.id });
        continue;
      }

      if (t.tag?.name) {
        const normalizedName = normalizeTagName(t.tag.name);

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

  const newRecord = await prisma.financialRecord.create({
    data: {
      amount: record.amount,
      type: record.type,
      date: record.date,
      categoryId: record.categoryId,
      source: record.source ?? undefined,
      description: record.description ?? undefined,
      currency: record.currency ?? "INR",
      baseAmount: baseAmount,
      baseCurrency: baseCurrency,
      exchangeRate: exchangeRate,
      projectId,
      createdByUserId: userId,
      tags: {
        create: tagConnections,
      },
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
  const {
    projectId,
    cursor,
    direction = "next",
    limit = 20,
    type,
    categoryId,
    fromDate,
    toDate,
    tags,
    source,
  } = params;
  if (params.projectId !== financeContext.projectAccessContext.projectId) {
    throw new Error("Unauthorized");
  }

  const safeLimit = Math.min(limit, 1000);

  const isNext = direction === "next";
  const cursorData: { date: Date; id: string } | undefined = cursor
    ? decodeCursor(cursor)
    : undefined;

  // Build WHERE dynamically
  const where: Prisma.FinancialRecordWhereInput = {
    projectId,
    deletedAt: null,
    ...(type && { type }),
    ...(categoryId && { categoryId }),

    ...(source && { source: source }),
    ...(fromDate || toDate
      ? {
          date: {
            ...(fromDate && { gte: new Date(fromDate) }),
            ...(toDate && { lte: new Date(toDate) }),
          },
        }
      : {}),

    ...(tags?.length
      ? {
          tags: {
            some: {
              tagId: { in: tags },
            },
          },
        }
      : {}),
  };

  // Order (IMPORTANT: must match cursorData)
  const orderBy:
    | Prisma.FinancialRecordOrderByWithRelationInput
    | Prisma.FinancialRecordOrderByWithRelationInput[] = [
    { date: isNext ? "desc" : "asc" },
    { id: isNext ? "desc" : "asc" },
  ];

  // Cursor condition
  const cursorCondition: Prisma.FinancialRecordWhereUniqueInput | undefined =
    cursorData != null
      ? {
          date_id: {
            date: new Date(cursorData.date),
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

  // 🔥 Normalize order (important for prev)
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
  const nextCursor: string | undefined = nextCursorData
    ? encodeCursor(nextCursorData)
    : undefined;

  const prevCursorData =
    finalRecords.length > 0
      ? {
          date: finalRecords[0].date,
          id: finalRecords[0].id,
        }
      : null;
  const prevCursor: string | undefined = prevCursorData
    ? encodeCursor(prevCursorData)
    : undefined;

  return {
    data: finalRecords,
    pageInfo: {
      hasNext: isNext ? hasMore : true,
      hasPrev: isNext ? true : hasMore,
      nextCursor: nextCursor,
      prevCursor: prevCursor,
    },
  };
}

export async function getRecord(
  recordId: string,
  financeContext: FinanceContext,
) {
  const record = await prisma.financialRecord.findUnique({
    where: {
      id: recordId,
      projectId: financeContext.projectAccessContext.projectId,
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
  data: FinanceRecordWithCategoryTags,
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
    const existingCategory = await prisma.financialRecordCategory.findUnique({
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

  if (data.amount || data.currency) {
    const amount = data.amount
      ? data.amount.toNumber()
      : Number(existingRecord.amount);

    const currency = data.currency || existingRecord.currency;

    const conversion = await convertCurrency(amount, currency, baseCurrency);

    baseAmount = conversion.baseAmount;
    exchangeRate = conversion.exchangeRate;
  }

  const tagConnections: { tagId: string }[] = [];

  if (data.tags?.length) {
    for (const t of data.tags) {
      if (t.tag?.id) {
        tagConnections.push({ tagId: t.tag.id });
        continue;
      }

      if (t.tag?.name) {
        const normalizedName = normalizeTagName(t.tag.name);

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

  // 5. Transaction (important for consistency)
  const updatedRecord = await prisma.$transaction(async (tx) => {
    // Remove old tags (replace behavior)
    if (data.tags) {
      await tx.financialRecordTagMap.deleteMany({
        where: { recordId },
      });
    }

    // Update record
    const record = await tx.financialRecord.update({
      where: { id: recordId },
      data: {
        amount: data.amount ?? undefined,
        type: data.type ?? undefined,
        date: data.date ?? undefined,
        categoryId: data.categoryId !== undefined ? data.categoryId : undefined,
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
  const userId = financeContext.userAccessContext.userId;
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
