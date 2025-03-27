import { Request } from 'express';
import { verifyToken } from '../utils/jwt';
import { User, IUser } from '../models/User';

export interface IContext {
  req: Request;
  user?: IUser;
}

export const authMiddleware = async ({ req }: { req: Request }): Promise<IContext> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return { req };
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Verify that the user still exists in the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return { req };
    }

    return { req, user };
  } catch (error) {
    return { req };
  }
}; 