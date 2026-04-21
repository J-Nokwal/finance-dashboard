import { Request, Response } from "express";
import { z } from "zod";
import {
  createTagSchema,
  getTagsQuerySchema,
  tagIdParamSchema,
  updateTagSchema,
} from "./tag.validation";
import { createTag, deleteTag, getTags, updateTag } from "./tag.services";
import { FinanceContext } from "../finance.types";

function buildFinanceContext(req: Request): FinanceContext {
  return {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
}

/**
 * @swagger
 * /api/projects/{projectId}/finance/tags:
 *   post:
 *     summary: Create tag
 *     description: Create a new finance tag for a project.
 *     tags: [Tags]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Travel"
 *     responses:
 *       201:
 *         description: Tag created successfully
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
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const postTagController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const bodyResult = createTagSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }

  const tag = await createTag(bodyResult.data.name, buildFinanceContext(req));
  res.status(201).json(tag);
};

/**
 * @swagger
 * /api/projects/{projectId}/finance/tags:
 *   get:
 *     summary: List tags
 *     description: Retrieve finance tags available for a project.
 *     tags: [Tags]
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
 *         description: Filter tags by name
 *     responses:
 *       200:
 *         description: List of tags
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
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const getTagsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryResult = getTagsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const tags = await getTags(queryResult.data, buildFinanceContext(req));
  res.status(200).json(tags);
};

/**
 * @swagger
 * /api/projects/{projectId}/finance/tags/{tagId}:
 *   patch:
 *     summary: Update tag
 *     description: Update a finance tag's name for a project.
 *     tags: [Tags]
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
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Tag"
 *     responses:
 *       200:
 *         description: Tag updated successfully
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
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
export const updateTagController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = tagIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const bodyResult = updateTagSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }

  const tag = await updateTag(
    paramsResult.data.tagId,
    bodyResult.data.name,
    buildFinanceContext(req),
  );

  res.status(200).json(tag);
};

/**
 * @swagger
 * /api/projects/{projectId}/finance/tags/{tagId}:
 *   delete:
 *     summary: Delete tag
 *     description: Delete a finance tag from a project. Requires MANAGE access.
 *     tags: [Tags]
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
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid tag ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Server error
 */
export const deleteTagController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = tagIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const result = await deleteTag(paramsResult.data.tagId, buildFinanceContext(req));
  res.status(200).json(result);
};
