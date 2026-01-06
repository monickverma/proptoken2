
import * as express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
  };
}

export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const request = req as any;
  const response = res as any;
  
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ 
      success: false, 
      error: { message: 'Authentication required. Missing Bearer token.' } 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (err) {
    return response.status(401).json({ 
      success: false, 
      error: { message: 'Access denied. Key has expired or is invalid.' } 
    });
  }
};
