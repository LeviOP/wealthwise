import { Request } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

export interface Context {
  req: Request;
  user?: any;
}

export const authMiddleware = async ({ req }: { req: Request }): Promise<Context> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return { req };
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Verify that the user still exists in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return { req };
    }

    return { req, user };
  } catch (error) {
    return { req };
  }
}; 