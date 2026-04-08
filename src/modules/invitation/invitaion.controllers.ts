import { Request, Response } from "express";
import { InvitationContext } from "./invitation.types";
import { acceptInvitationParamSchema, rejectInvitationParamSchema } from "./invitation.validations";
import { z } from "zod";
import { acceptInvitation, rejectInvitation } from "./invitaion.services";
export const acceptInvitationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const invitationContext: InvitationContext = {
    userAccessContext: req.userAccessContext!,
  };
  const paramsResult = acceptInvitationParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
  acceptInvitation(
    paramsResult.data.invitationId,
    invitationContext,
  );
  res.status(200).json({ message: "Invitation accepted successfully" });
};

export const rejectInvitationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
    const invitationContext: InvitationContext = {
    userAccessContext: req.userAccessContext!,
  };
  const paramsResult = rejectInvitationParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ errors: z.treeifyError(paramsResult.error) });
    return;
  }
  rejectInvitation(
    paramsResult.data.invitationId,
    invitationContext,
  );
  res.status(200).json({ message: "Invitation rejected successfully" });

};
