import { RecordType } from "@/generated/prisma/enums";
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  type: z.enum(RecordType, { message: "Invalid record type" }),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").optional(),
  type: z.enum(RecordType, { message: "Invalid record type" }).optional(),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.string().uuid({ message: "Invalid category id" }),
});

export const getCategoriesQuerySchema = z.object({
  name: z.string().optional(),
  type: z.enum(RecordType, { message: "Invalid record type" }).optional(),
});
