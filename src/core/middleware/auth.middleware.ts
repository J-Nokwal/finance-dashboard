import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { JwtAccessPayload, UserAccessContext } from "../types/middleware.types";




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

    req.userAccessContext= {
      userId: payload.sub,
      sessionId: payload.jti
    }

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
  req: Request ,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.userAccessContext === undefined) {
    res.status(401).json({
      success: false,
      message: "Session is invalid or has been revoked. Add requireAuth middleware first.",
      code: "SESSION_INVALID",
    });
    return;
  }

  try {
    const session = await prisma.authSession.findUnique({
      where: { id: req.userAccessContext.sessionId },
      select: {
        userId: true,
        expiresAt: true,
      },
    });
 
    if (!session || session.userId !== req.userAccessContext.userId) {
      res.status(401).json({
        success: false,
        message: "Session is invalid or has been revoked.",
        code: "SESSION_INVALID",
      });
      return;
    }
 
    if (session.expiresAt < new Date() ) {
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
