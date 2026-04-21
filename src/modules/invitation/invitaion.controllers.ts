import { Request, Response } from "express";
import { InvitationContext } from "./invitation.types";
import { acceptInvitationParamSchema, rejectInvitationParamSchema } from "./invitation.validations";
import { z } from "zod";
import { acceptInvitation, rejectInvitation } from "./invitaion.services";

/**
 * @swagger
 * /api/invitations/{invitationId}/accept:
 *   post:
 *     summary: Accept invitation
 *     description: Accept an organization or project invitation.
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The invitation ID
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation accepted successfully"
 *       400:
 *         description: Invalid invitation ID
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/invitations/{invitationId}/reject:
 *   post:
 *     summary: Reject invitation
 *     description: Reject an organization or project invitation.
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The invitation ID
 *     responses:
 *       200:
 *         description: Invitation rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation rejected successfully"
 *       400:
 *         description: Invalid invitation ID
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Server error
 */
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
