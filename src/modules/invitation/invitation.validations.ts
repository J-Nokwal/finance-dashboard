import { z } from "zod";

export const acceptInvitationParamSchema = z.object({
  invitationId: z.uuidv4("Invalid invitation ID"),
});
export const rejectInvitationParamSchema = z.object({
  invitationId: z.uuidv4("Invalid invitation ID"),
})