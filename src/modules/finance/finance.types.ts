import { Prisma, RecordSource, RecordType } from "@/generated/prisma/browser";
import { ProjectAccessContext, UserAccessContext } from "@/src/core/types/middleware.types";

export type FinanceContext = {
    userAccessContext: UserAccessContext;
    projectAccessContext: ProjectAccessContext;
};

// type InvitationWithProjects = Prisma.InvitationGetPayload<{
//   include: {
//     projectInvites: {
//       include: {
//         project: {
//           select: { name: true };
//         };
//       };
//     };
//   };
// }>;

export type FinanceRecordWithCategoryTags = Prisma.FinancialRecordGetPayload<{
    include: {
      tags: {
        include: {
          tag: true;
        };
      };
      category: true;
    };
  }>

export type GetRecordsParams = {
  projectId: string;
  cursor?: string;
  direction?: "next" | "prev";
  limit?: number;
  // filters
  type?: RecordType;
  categoryId?: string;
  fromDate?: Date;
  toDate?: Date;
  source?: RecordSource;
  tags?: string[]; // tagIds
};