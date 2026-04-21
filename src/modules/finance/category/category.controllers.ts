import { Request, Response } from "express";
import { z } from "zod";
import {
  categoryIdParamSchema,
  createCategorySchema,
  getCategoriesQuerySchema,
  updateCategorySchema,
} from "./category.validations";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./category.services";
import { FinanceContext } from "../finance.types";

function buildFinanceContext(req: Request): FinanceContext {
  return {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
}

export const postCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const bodyResult = createCategorySchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }

  const category = await createCategory(bodyResult.data, buildFinanceContext(req));
  res.status(201).json(category);
};

export const getCategoriesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryResult = getCategoriesQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const categories = await getCategories(queryResult.data, buildFinanceContext(req));
  res.status(200).json(categories);
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = categoryIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const bodyResult = updateCategorySchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }

  if (Object.keys(bodyResult.data).length === 0) {
    res.status(400).json({ message: "No update fields provided" });
    return;
  }

  const category = await updateCategory(
    paramsResult.data.categoryId,
    bodyResult.data,
    buildFinanceContext(req),
  );

  res.status(200).json(category);
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = categoryIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const result = await deleteCategory(paramsResult.data.categoryId, buildFinanceContext(req));
  res.status(200).json(result);
};
