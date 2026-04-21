import { Request, Response } from "express";
import { z } from "zod";
import {
  createFinanceRecordSchema,
  deleteFinanceRecordParamSchema,
  getFinanceRecordParamSchema,
  getFinanceRecordsQuerySchema,
  updateFinanceRecordSchema,
} from "./record.validations";
import {
  deleteRecord,
  getRecord,
  getRecords,
  postRecord,
  updateRecord,
} from "./record.services";
import {
  FinanceContext,
  FinanceRecordCreatePayload,
  FinanceRecordUpdatePayload,
} from "../finance.types";

function buildFinanceContext(req: Request): FinanceContext {
  return {
    projectAccessContext: req.projectAccessContext!,
    userAccessContext: req.userAccessContext!,
  };
}

function createErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  const status = /not found/i.test(message) ? 404 : 400;
  return { status, body: { message } };
}

/**
 * @swagger
 * /api/projects/{projectId}/finance/records:
 *   post:
 *     summary: Create finance record
 *     description: Create a new financial record for a project.
 *     tags: [Financial Records]
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
 *               - amount
 *               - type
 *               - categoryId
 *               - date
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1200.5
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               tags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tagId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *               source:
 *                 type: string
 *               description:
 *                 type: string
 *               currency:
 *                 type: string
 *                 example: INR
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 amount:
 *                   type: number
 *                 type:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                   format: uuid
 *                 date:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const postRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const bodyResult = createFinanceRecordSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }

  const financeContext = buildFinanceContext(req);

  try {
    const record = await postRecord(
      bodyResult.data as FinanceRecordCreatePayload,
      financeContext,
    );
    res.status(201).json(record);
  } catch (error) {
    const response = createErrorResponse(error);
    res.status(response.status).json(response.body);
  }
};

/**
 * @swagger
 * /api/projects/{projectId}/finance/records:
 *   get:
 *     summary: List finance records
 *     description: Retrieve financial records for a project with optional filtering and pagination.
 *     tags: [Financial Records]
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
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [next, prev]
 *         description: Pagination direction
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of records to return
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filter by record type
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter by source
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter by tag IDs
 *     responses:
 *       200:
 *         description: List of financial records
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
 *                   amount:
 *                     type: number
 *                   type:
 *                     type: string
 *                   categoryId:
 *                     type: string
 *                     format: uuid
 *                   date:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
export const getRecordsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryResult = getFinanceRecordsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ errors: z.treeifyError(queryResult.error) });
    return;
  }

  const financeContext = buildFinanceContext(req);
  const params = {
    projectId: financeContext.projectAccessContext.projectId,
    cursor: queryResult.data.cursor,
    direction: queryResult.data.direction,
    limit: queryResult.data.limit,
    type: queryResult.data.type,
    categoryId: queryResult.data.categoryId,
    fromDate: queryResult.data.fromDate,
    toDate: queryResult.data.toDate,
    source: queryResult.data.source,
    tags: queryResult.data.tags,
  };

  try {
    const records = await getRecords(params, financeContext);
    res.status(200).json(records);
  } catch (error) {
    const response = createErrorResponse(error);
    res.status(response.status).json(response.body);
  }
};

/**
 * @swagger
 * /api/projects/{projectId}/finance/records/{recordId}:
 *   get:
 *     summary: Get finance record
 *     description: Retrieve a single financial record by ID.
 *     tags: [Financial Records]
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
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The record ID
 *     responses:
 *       200:
 *         description: Financial record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 amount:
 *                   type: number
 *                 type:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                   format: uuid
 *                 date:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid record ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
export const getRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = getFinanceRecordParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const financeContext = buildFinanceContext(req);

  try {
    const record = await getRecord(paramsResult.data.recordId, financeContext);
    res.status(200).json(record);
  } catch (error) {
    const response = createErrorResponse(error);
    res.status(response.status).json(response.body);
  }
};

/**
 * @swagger
 * /api/projects/{projectId}/finance/records/{recordId}:
 *   patch:
 *     summary: Update finance record
 *     description: Update fields on an existing financial record.
 *     tags: [Financial Records]
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
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               tags:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tagId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *               source:
 *                 type: string
 *               description:
 *                 type: string
 *               currency:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 amount:
 *                   type: number
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
export const updateRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = getFinanceRecordParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const bodyResult = updateFinanceRecordSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ errors: z.treeifyError(bodyResult.error) });
    return;
  }

  const financeContext = buildFinanceContext(req);

  try {
    const updatedRecord = await updateRecord(
      paramsResult.data.recordId,
      bodyResult.data as FinanceRecordUpdatePayload,
      financeContext,
    );
    res.status(200).json(updatedRecord);
  } catch (error) {
    const response = createErrorResponse(error);
    res.status(response.status).json(response.body);
  }
};

/**
 * @swagger
 * /api/projects/{projectId}/finance/records/{recordId}:
 *   delete:
 *     summary: Delete finance record
 *     description: Permanently delete a financial record. Requires MANAGE access.
 *     tags: [Financial Records]
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
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The record ID
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid record ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
export const deleteRecordController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsResult = deleteFinanceRecordParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }

  const financeContext = buildFinanceContext(req);

  try {
    const result = await deleteRecord(paramsResult.data.recordId, financeContext);
    res.status(200).json(result);
  } catch (error) {
    const response = createErrorResponse(error);
    res.status(response.status).json(response.body);
  }
};
