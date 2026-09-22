import type { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}