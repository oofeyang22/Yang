// api/register.ts
//import type { Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDB } from '../server/db';
import User from '../server/models/userModel';
import bcrypt from 'bcryptjs';

const saltRounds = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectToDB();

  try {
    // Explicitly type req.body for safety
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));

    const user = await User.create({ username, email, password: hashed });

    // Convert to plain object so we can safely modify it
    const userObj = user.toObject() as Record<string, any>;
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

