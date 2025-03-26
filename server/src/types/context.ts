import { Request } from 'express';
import { IUser } from '../models/User';

export interface IContext {
  req: Request;
  user?: IUser;
} 