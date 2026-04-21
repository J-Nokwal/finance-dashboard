import { Request, Response } from "express";

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get the profile information of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Server error
 */
export const getCurrentUser = async (req : Request, res :Response ) : Promise<void> => {};

/**
 * @swagger
 * /api/users/me/invitations:
 *   get:
 *     summary: Get current user's invitations
 *     description: Get all invitations for the currently authenticated user (pending, accepted, rejected).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invitation'
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Server error
 */
export const getCurerntUserInvitations = async (req : Request, res :Response ) : Promise<void> => {};