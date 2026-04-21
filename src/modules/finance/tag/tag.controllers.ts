import { Request, Response } from "express";
import { FinanceContext } from "../finance.types";

export const postTagController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};

export const getTagsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};

export const updateTagController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};

export const deleteTagController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const financeContext: FinanceContext = {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
};
