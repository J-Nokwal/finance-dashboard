import { Request, Response } from "express";
import { FinanceContext } from "../finance.types";

export const postRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};

// Filters
// type=INCOME
// &categoryId=1
// &startDate=2023-01-01
// &endDate=2023-12-31
// &source=CASH
// &tag=food
// &tag=entertainment
// &page=1
// &limit=10
export const getRecordsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};

export const getRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};

export const updateRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};

export const deleteRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};
