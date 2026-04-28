import prisma from "../../../../src/core/config/prisma";
import { FinanceContext } from "../finance.types";
import { RecordType } from "../../../../generated/prisma/enums";

export async function getSummary(
  financeContext: FinanceContext,
  filters: {
    fromDate?: Date;
    toDate?: Date;
    categoryId?: string;
    type?: RecordType;
  },
) {
  const projectId = financeContext.projectAccessContext.projectId;

  const where = {
    projectId,
    deletedAt: null,
    ...(filters.type && { type: filters.type }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.fromDate || filters.toDate
      ? {
          date: {
            ...(filters.fromDate && { gte: filters.fromDate }),
            ...(filters.toDate && { lte: filters.toDate }),
          },
        }
      : {}),
  };

  const totals = await prisma.financialRecord.groupBy({
    by: ["type"],
    where,
    _sum: {
      amount: true,
      baseAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const response = {
    income: {
      count: 0,
      amount: 0,
      baseAmount: 0,
    },
    expense: {
      count: 0,
      amount: 0,
      baseAmount: 0,
    },
    total: {
      count: 0,
      amount: 0,
      baseAmount: 0,
    },
  };

  for (const total of totals) {
    const typeKey = total.type === RecordType.INCOME ? "income" : "expense";
    const amount = Number(total._sum.amount ?? 0);
    const baseAmount = Number(total._sum.baseAmount ?? 0);
    const count = total._count.id;

    response[typeKey] = {
      count,
      amount,
      baseAmount,
    };
    response.total = {
      count: response.total.count + count,
      amount: response.total.amount + amount,
      baseAmount: response.total.baseAmount + baseAmount,
    };
  }

  return response;
}

export async function getCategoryBreakdown(
  financeContext: FinanceContext,
  filters: {
    fromDate?: Date;
    toDate?: Date;
    categoryId?: string;
    type?: RecordType;
  },
) {
  const projectId = financeContext.projectAccessContext.projectId;

  const where = {
    projectId,
    deletedAt: null,
    ...(filters.type && { type: filters.type }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.fromDate || filters.toDate
      ? {
          date: {
            ...(filters.fromDate && { gte: filters.fromDate }),
            ...(filters.toDate && { lte: filters.toDate }),
          },
        }
      : {}),
  };

  const breakdown = await prisma.financialRecord.groupBy({
    by: ["categoryId", "type"],
    where,
    _sum: {
      amount: true,
      baseAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const categoryIds = [...new Set(breakdown.map((entry) => entry.categoryId))];
  const categories = categoryIds.length
    ? await prisma.financialRecordCategory.findMany({
        where: { id: { in: categoryIds } },
      })
    : [];

  const categoriesById = categories.reduce<Record<string, { id: string; name: string; type: string }>>(
    (acc, category) => {
      acc[category.id] = {
        id: category.id,
        name: category.name,
        type: category.type,
      };
      return acc;
    },
    {},
  );

  return breakdown.map((entry) => ({
    category: categoriesById[entry.categoryId] ?? {
      id: entry.categoryId,
      name: "Unknown",
      type: entry.type,
    },
    type: entry.type,
    count: entry._count.id,
    amount: Number(entry._sum.amount ?? 0),
    baseAmount: Number(entry._sum.baseAmount ?? 0),
  }));
}

function buildPeriodKey(date: Date, granularity: "day" | "week" | "month") {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  if (granularity === "day") {
    return utcDate.toISOString().slice(0, 10);
  }

  if (granularity === "week") {
    const tmp = new Date(utcDate);
    const day = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  return `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getTrend(
  financeContext: FinanceContext,
  filters: {
    fromDate?: Date;
    toDate?: Date;
    categoryId?: string;
    type?: RecordType;
    granularity?: "day" | "week" | "month";
    limit?: number;
  },
) {
  const projectId = financeContext.projectAccessContext.projectId;
  const granularity = filters.granularity ?? "month";

  const where = {
    projectId,
    deletedAt: null,
    ...(filters.type && { type: filters.type }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.fromDate || filters.toDate
      ? {
          date: {
            ...(filters.fromDate && { gte: filters.fromDate }),
            ...(filters.toDate && { lte: filters.toDate }),
          },
        }
      : {}),
  };

  const records = await prisma.financialRecord.findMany({
    where,
    select: {
      date: true,
      type: true,
      baseAmount: true,
    },
  });

  const trendMap = new Map<string, { period: string; income: number; expense: number; total: number }>();

  for (const record of records) {
    const period = buildPeriodKey(record.date, granularity);
    const row = trendMap.get(period) ?? { period, income: 0, expense: 0, total: 0 };

    const amount = Number(record.baseAmount ?? 0);
    if (record.type === RecordType.INCOME) {
      row.income += amount;
    } else {
      row.expense += amount;
    }
    row.total += amount;
    trendMap.set(period, row);
  }

  const trend = Array.from(trendMap.values()).sort((a, b) => (a.period < b.period ? -1 : 1));

  return filters.limit ? trend.slice(-filters.limit) : trend;
}

export async function getRecentRecords(
  financeContext: FinanceContext,
  limit = 10,
) {
  const projectId = financeContext.projectAccessContext.projectId;

  return prisma.financialRecord.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    take: Math.min(limit, 100),
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}
