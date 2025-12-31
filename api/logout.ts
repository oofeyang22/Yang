// api/logout.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import cookie from 'cookie';

// Define the handler function for Vercel
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Serialize the 'token' cookie to clear it
    const serialized = cookie.serialize('token', '', {
      httpOnly: true,
      // Use `secure: true` in production environments (when using HTTPS)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire the cookie immediately
    });

    // 2. Set the 'Set-Cookie' header
    res.setHeader('Set-Cookie', serialized);

    // 3. Send a successful JSON response
    return res.status(200).json({ ok: true, message: 'Logout successful' });
    
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
}