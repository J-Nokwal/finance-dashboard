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
