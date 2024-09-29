import { NextFunction, Request, Response } from 'express';
import prisma from '../utils/db';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const accessMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const isAdmin = user.role === 'ADMIN';

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

export default accessMiddleware;
