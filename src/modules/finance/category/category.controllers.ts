import { Request, Response } from "express";
import { FinanceContext } from "../finance.types";

export const postCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
   const financeContext: FinanceContext = {
        projectAccessContext: req.projectAccessContext!,
        userAccessContext: req.userAccessContext!,
      };
};

// Filters
// &name=food
// &type=EXPENSE
export const getCategoriesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
   const financeContext: FinanceContext = {
      projectAccessContext: req.projectAccessContext!,
      userAccessContext: req.userAccessContext!,
    };
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
   const financeContext: FinanceContext = {
      projectAccessContext: req.projectAccessContext!,
      userAccessContext: req.userAccessContext!,
    };
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
   const financeContext: FinanceContext = {
      projectAccessContext: req.projectAccessContext!,
      userAccessContext: req.userAccessContext!,
    };
};

