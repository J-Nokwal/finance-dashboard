import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required"),
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required"),
});

export const tagIdParamSchema = z.object({
  tagId: z.string().uuid({ message: "Invalid tag id" }),
});

export const getTagsQuerySchema = z.object({
  name: z.string().optional(),
});
