import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authMiddlware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  try {
    const userId = jwt.verify(token, process.env.JWT_SECRET!) as string;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    req.userId = userId;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }
};

export default authMiddlware;
