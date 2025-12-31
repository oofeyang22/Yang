// api/login.ts (or loginController.ts)
/*
import { connectToDB } from '../server/db';
import User from '../server/models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Request, Response } from 'express'; // ⬅️ Use Express types
import { Document, Types } from 'mongoose';

// --- TYPE DEFINITIONS ---

// Define the structure of your User document (put this in your userModel.ts)
interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  // This is how Mongoose stores the hash. It should be explicitly selected in the query.
  password?: string; 
}

// Define the expected shape of the request body
interface LoginRequestBody {
  username: string;
  password?: string;
}

// Define the expected shape of the response body on success
interface LoginResponseBody {
  id: Types.ObjectId;
  username: string;
}
// --- END TYPE DEFINITIONS ---

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET environment variable not set');
}

// Handler function using Express types
export async function loginHandler(
  req: VercelRequest, // 1st {} for Params, 2nd for Response Body, 3rd for Request Body
  res: VercelResponse
) {
  // 1. Method Check (usually handled by Express router, but kept for robustness)
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  // 2. Connect to DB
  try {
    await connectToDB();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  try {
    // TypeScript now knows the shape of req.body
    const { username, password } = req.body; 
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // 3. Find User
    // Use .select('+password') to retrieve the password hash
    const user = await User.findOne({ username }).select('+password') as IUser | null; 
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // 4. Validate Password
    if (!user.password) {
        return res.status(500).json({ error: 'Server error: Password hash missing' });
    }
    
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 5. Generate Token
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET!, { expiresIn: '7d' });
    
    // 6. Serialize Cookie
    const serialized = cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 7. Send Response
    res.setHeader('Set-Cookie', serialized);
    res.status(200).json({ id: user._id, username: user.username });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}*/

import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

import { connectToDB } from '../server/db';
import User from '../server/models/userModel';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1️⃣ Connect DB
    await connectToDB();
    console.log('Database connected successfully');

    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    console.log(`Login attempt for username: ${username}`);

    // 2️⃣ Find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    console.log(`Token generated for user: ${user.username}`);

    // 5️⃣ Set cookie (🔥 correct for serverless)
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
