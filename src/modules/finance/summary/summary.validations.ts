import { z } from "zod";
import { RecordType } from "../../../../generated/prisma/enums";

const optionalDate = z.coerce.date().optional();

export const summaryQuerySchema = z.object({
  fromDate: optionalDate,
  toDate: optionalDate,
  categoryId: z.string().uuid().optional(),
  type: z.enum(RecordType, { message: "Invalid record type" }).optional(),
});

export const breakdownQuerySchema = summaryQuerySchema;

export const trendQuerySchema = summaryQuerySchema.extend({
  granularity: z.enum(["day", "week", "month"]).optional(),
  limit: z.coerce.number().int().positive().max(365).optional(),
});

export const recentRecordsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});
