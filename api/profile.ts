// api/profile.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt, { JwtPayload } from 'jsonwebtoken';
//import cookie from 'cookie';
import * as cookie from 'cookie';

// Define the shape of the decoded JWT payload
interface UserInfo extends JwtPayload {
  userId: string;
  username: string;
}

// Environment Variable Check
const envSecret = process.env.JWT_SECRET;
if (!envSecret) {
  console.error('FATAL: JWT_SECRET environment variable not set.');
  throw new Error('JWT_SECRET not set');
}
const SECRET: string = envSecret;

// Use Vercel's types for serverless functions
export default function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Check HTTP Method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Parse Cookies
    const cookieHeader = req.headers.cookie;
    const cookies = cookie.parse(cookieHeader || '');
    const token = cookies.token;

    // 3. Check for Token
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // 4. Verify Token (synchronous version for simplicity)
    try {
      const decoded = jwt.verify(token, SECRET) as UserInfo;
      return res.status(200).json({
        userId: decoded.userId,
        username: decoded.username
      });
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

  } catch (err) {
    // 5. Handle Server Errors
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}