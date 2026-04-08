import { Prisma } from "@/generated/prisma/browser";
import { OrganizationRole, User } from "@/generated/prisma/client";
import { OrganizationAccessContext, UserAccessContext } from "@/src/core/types/middleware.types";


type OrganizationContext = {
    userAccessContext: UserAccessContext;
    organizationAccessContext: OrganizationAccessContext;
};

type InvitationWithProjects = Prisma.InvitationGetPayload<{
  include: {
    projectInvites: {
      include: {
        project: {
          select: { name: true };
        };
      };
    };
  };
}>;
type InvitationProjectWithDomain = Prisma.InvitationProjectGetPayload<{
  include: {
    domainInvites: true;
  };
}>

export type { InvitationWithProjects, OrganizationContext ,InvitationProjectWithDomain  };
