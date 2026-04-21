import { Request, Response } from "express";
import { z } from "zod";
import {
  breakdownQuerySchema,
  recentRecordsQuerySchema,
  summaryQuerySchema,
  trendQuerySchema,
} from "./summary.validations";
import {
  getCategoryBreakdown,
  getRecentRecords,
  getSummary,
  getTrend,
} from "./summary.services";
import { FinanceContext } from "../finance.types";

function buildFinanceContext(req: Request): FinanceContext {
  return {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
}

export const getSummaryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryResult = summaryQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const result = await getSummary(buildFinanceContext(req), queryResult.data);
  res.status(200).json(result);
};

export const getCategoryBreakdownController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryResult = breakdownQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const result = await getCategoryBreakdown(buildFinanceContext(req), queryResult.data);
  res.status(200).json(result);
};

export const getTrendController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryResult = trendQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const result = await getTrend(buildFinanceContext(req), queryResult.data);
  res.status(200).json(result);
};

export const getRecentRecordsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryResult = recentRecordsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const result = await getRecentRecords(
    buildFinanceContext(req),
    queryResult.data.limit ?? 10,
  );
  res.status(200).json(result);
};
