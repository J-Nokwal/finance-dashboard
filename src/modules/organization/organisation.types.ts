import { Prisma } from "@/generated/prisma/browser";
import { OrganizationRole, User } from "@/generated/prisma/client";


type OrganizationUserContext = {
    organizationId?: string;
    currentUserId?: string;
    effectiveRole?: OrganizationRole;
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

export type { InvitationWithProjects, OrganizationUserContext   };
