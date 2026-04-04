import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { JwtAccessPayload } from "../types/middleware.types";




function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}


export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      message: "No access token provided.",
    });
    return;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtAccessPayload;


    req.userId =  payload.sub as string;
    req.sessionId = payload.jti as string;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Access token has expired.",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid access token.",
      code: "TOKEN_INVALID",
    });
  }
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await prisma.authSession.findUnique({
      where: { id: req.sessionId },
      select: {
        userId: true,
        expiresAt: true,
      },
    });
 
    if (!session || session.userId !== req.userId) {
      res.status(401).json({
        success: false,
        message: "Session is invalid or has been revoked.",
        code: "SESSION_INVALID",
      });
      return;
    }
 
    if (session.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        message: "Session has expired. Please log in again.",
        code: "SESSION_EXPIRED",
      });
      return;
    }
 
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error during session validation.",
    });
  }
}
