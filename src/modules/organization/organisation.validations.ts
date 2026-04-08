import { InvitationProject } from "@/generated/prisma/client";
import { InvitationStatus, OrganizationRole, ProjectRole } from "@/generated/prisma/enums";
import { z } from "zod";
import { InvitationProjectWithDomain } from "./organisation.types";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required").optional(),
});
export const updateOrganizationSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field must be provided",
  });

export const deleteOrganizationSchema = z.object({
  otpId: z.uuidv4("Invalid OTP session"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const updateOrganizationMemberSchema = z.object({
  userId: z.uuidv4("Invalid user ID"),
  role: z.enum(OrganizationRole,{ message: "Invalid organization role" }),
});

export const updateOrgMemberParamSchema = z.object({
  userId: z.uuidv4("Invalid user ID"),
});
export const removeOrgMemberParamSchema = z.object({
  userId: z.uuidv4("Invalid user ID"),
})
export const changeOrgMemberRoleParamSchema = z.object({
  userId: z.uuidv4("Invalid user ID"),
})
export const changeOrgMemberRoleSchema = z.object({
  role: z.enum(OrganizationRole,{ message: "Invalid organization role" }),
  userId: z.uuidv4("Invalid user ID"),
})

export const listOrganizationInvitationsQuerySchema = z.object({
    userId: z.uuidv4("Invalid user ID").optional(),
    status: z.array(z.enum(InvitationStatus,{ message: "Invalid invitation status" })).optional(),
})

export const inviteOrganizationMemberSchema = z.object({
    email: z.email("Invalid email"),
    role: z.enum(OrganizationRole,{ message: "Invalid organization role" }),
    // projectInvitations: z.array(z.object({
    //     projectId: z.string(),
    //     role: z.enum(ProjectRole,{ message: "Invalid project role" }),
    // })) 
    // cast as InvitationProject[]
    projectInvitations: z.array(z.any()).transform((val) => val as InvitationProjectWithDomain[]),

})

export const revokeOrgInvitationParamSchema = z.object({
    invitationId: z.uuidv4("Invalid invitation ID"),
})
export const resendOrgInvitationParamSchema = z.object({
    invitationId: z.uuidv4("Invalid invitation ID"),
})

export const createOrganizationProjectSchema = z.object({
    name: z.string().min(1, "Name is required"),
})
export const deleteOrgProjectParamSchema = z.object({
    projectId: z.uuidv4("Invalid project ID"),
})