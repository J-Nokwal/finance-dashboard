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
