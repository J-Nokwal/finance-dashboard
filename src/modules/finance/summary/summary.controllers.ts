import { Request, Response } from "express";
import { FinanceContext } from "../finance.types";

export const getSummaryController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const financeContext: FinanceContext = {
            projectAccessContext: req.projectAccessContext!,
            userAccessContext: req.userAccessContext!,
          };
};

export const getCategoryBreakdownController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const financeContext:FinanceContext = {
        projectAccessContext: req.projectAccessContext!,
        userAccessContext: req.userAccessContext!,
      };
};

export const getTrendController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const financeContext:FinanceContext = {
        projectAccessContext: req.projectAccessContext!,
        userAccessContext: req.userAccessContext!,
      };
};

export const getRecentRecordsController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const financeContext:FinanceContext = {
        projectAccessContext: req.projectAccessContext!,
        userAccessContext: req.userAccessContext!,
      };
};