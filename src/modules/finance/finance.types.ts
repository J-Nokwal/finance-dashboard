import { Prisma, RecordSource, RecordType, Currency } from "../../../generated/prisma/browser";
import { ProjectAccessContext, UserAccessContext } from "../../../src/core/types/middleware.types";

export type FinanceContext = {
  userAccessContext: UserAccessContext;
  projectAccessContext: ProjectAccessContext;
};

export type FinanceRecordTagInput = {
  tagId?: string;
  name?: string;
};

export type FinanceRecordCreatePayload = {
  amount: number;
  type: RecordType;
  categoryId: string;
  tags?: FinanceRecordTagInput[];
  source?: RecordSource;
  description?: string;
  currency?: Currency;
  date: Date;
};

export type FinanceRecordUpdatePayload = Partial<FinanceRecordCreatePayload>;

export type FinanceRecordWithCategoryTags = Prisma.FinancialRecordGetPayload<{
  include: {
    tags: {
      include: {
        tag: true;
      };
    };
    category: true;
  };
}>;

export type GetRecordsParams = {
  projectId: string;
  cursor?: string;
  direction?: "next" | "prev";
  limit?: number;
  type?: RecordType;
  categoryId?: string;
  fromDate?: Date;
  toDate?: Date;
  source?: RecordSource;
  tags?: string[];
};
