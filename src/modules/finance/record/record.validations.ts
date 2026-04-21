import { Currency, RecordSource, RecordType } from "@/generated/prisma/enums";
import { z } from "zod";

export const createFinanceRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(RecordType, { message: "Invalid record type" }),
  categoryId: z.string().optional(),
  tags: z
    .array(
      z.object({
        tagId: z.string().optional(),
        name: z.string().min(1, "Tag name is required").optional(),
      }),
    )
    .optional(),
  source: z.enum(RecordSource, { message: "Invalid record source" }).optional(),
  description: z.string().max(1000).optional(),
  currency: z.enum(Currency, { message: "Invalid currency" }).default("INR"),
  projectId: z.string(),
  date: z.coerce.date().optional(),
});

export const updateFinanceRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(RecordType, { message: "Invalid record type" }).optional(),
  categoryId: z.string().optional(),
  tags: z
    .array(
      z.object({
        tagId: z.string().optional(),
        name: z.string().min(1, "Tag name is required").optional(),
      }),
    )
    .optional(),
  source: z.enum(RecordSource, { message: "Invalid record source" }).optional(),
  description: z.string().max(1000).optional(),
  currency: z.enum(Currency, { message: "Invalid currency" }).default("INR"),
  projectId: z.string().optional(),
  date: z.coerce.date().optional(),
});

export const getFinanceRecordParamSchema = z.object({
  recordId: z.string(),
});
export const getFinanceRecordsQuerySchema = z.object({
  direction: z
    .enum(["next", "prev"], { message: "Invalid direction" })
    .optional(),
  limit: z
    .number()
    .positive()
    .min(1, {
      message: "Limit must be a positive number",
    })
    .max(1000, { message: "Limit must be at most 1000" })
    .optional(),
  type: z.enum(RecordType, { message: "Invalid record type" }).optional(),
  categoryId: z.uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  source: z.enum(RecordSource, { message: "Invalid record source" }).optional(),
  tags: z.array(z.string()).optional(),
});

export const deleteFinanceRecordParamSchema = z.object({
  recordId: z.string(),
});
