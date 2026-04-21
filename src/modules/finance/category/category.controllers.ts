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

/**
 * @swagger
 * /api/projects/{projectId}/finance/categories:
 *   post:
 *     summary: Create category
 *     description: Create a new financial category for a project.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Salary"
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/projects/{projectId}/finance/categories:
 *   get:
 *     summary: List categories
 *     description: Retrieve all financial categories for a project.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter categories by name
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter categories by record type
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/projects/{projectId}/finance/categories/{categoryId}:
 *   patch:
 *     summary: Update category
 *     description: Update a financial category for a project.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *       400:
 *         description: Invalid request or no update fields provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/projects/{projectId}/finance/categories/{categoryId}:
 *   delete:
 *     summary: Delete category
 *     description: Delete a financial category from a project. Requires MANAGE access.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The project ID
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
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
