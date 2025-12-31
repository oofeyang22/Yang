

// api/posts.ts
/*
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDB } from '../server/db';
import Post from '../server/models/postModel';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const SECRET = process.env.JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDB();

    switch (req.method) {
      case 'GET':
        return await handleGetPosts(req, res);
      case 'POST':
        return await handleCreatePost(req, res);
      case 'OPTIONS':
        return res.status(200).end();
      default:
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGetPosts(req: VercelRequest, res: VercelResponse) {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    
    return res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    return res.status(500).json({ error: 'Could not fetch posts' });
  }
}

async function handleCreatePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Authentication
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const info = jwt.verify(token, SECRET) as { id: string; username: string };
    
    // Parse request body
    const { title, summary, content, category, coverUrl } = req.body;

    // Validation
    if (!title || !summary || !content || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'summary', 'content', 'category']
      });
    }

    // Validate coverUrl if provided (it's optional)
    let validCoverUrl = null;
    if (coverUrl) {
      // Basic URL validation
      try {
        new URL(coverUrl);
        validCoverUrl = coverUrl;
      } catch {
        return res.status(400).json({ error: 'Invalid cover URL format' });
      }
    }

    // Create post
    const post = await Post.create({
      title,
      summary,
      content,
      cover: validCoverUrl,
      category,
      author: info.id,
    });

    // Return created post
    const populatedPost = await Post.findById(post._id)
      .populate('author', ['username']);
    
    return res.status(201).json(populatedPost);

  } catch (err) {
    console.error('Error creating post:', err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ 
      error: 'Could not create post',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}*/

// api/posts.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDB } from '../server/db';
import User from '../server/models/userModel';
import Post from '../server/models/postModel';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const SECRET = process.env.JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDB();

    switch (req.method) {
      case 'GET':
        return await handleGetPosts(req, res);
      case 'POST':
        return await handleCreatePost(req, res);
      case 'OPTIONS':
        return res.status(200).end();
      default:
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGetPosts(req: VercelRequest, res: VercelResponse) {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    
    return res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    return res.status(500).json({ error: 'Could not fetch posts' });
  }
}

async function handleCreatePost(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Authentication - Safe cookie handling
    let token: string | undefined;

    try {
      // Try to get token from cookies (Vercel's parsed cookies)
      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } 
      // Fallback to manual parsing if cookie module is available
      else if (req.headers.cookie) {
        const cookies = cookie.parse(req.headers.cookie);
        token = cookies.token;
      }
    } catch (cookieError) {
      console.error('Error parsing cookies:', cookieError);
      // Last resort - manual extraction
      if (req.headers.cookie) {
        const match = req.headers.cookie.match(/token=([^;]+)/);
        token = match ? match[1] : undefined;
      }
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify JWT token
    let info: { id: string; username: string };
    try {
      info = jwt.verify(token, SECRET) as { id: string; username: string };
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Parse request body
    const { title, summary, content, category, coverUrl } = req.body;

    // Validation
    if (!title || !summary || !content || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'summary', 'content', 'category']
      });
    }

    // Validate coverUrl if provided (it's optional)
    let validCoverUrl = null;
    if (coverUrl) {
      // Basic URL validation
      try {
        new URL(coverUrl);
        validCoverUrl = coverUrl;
      } catch {
        return res.status(400).json({ error: 'Invalid cover URL format' });
      }
    }

    // Create post
    const post = await Post.create({
      title,
      summary,
      content,
      cover: validCoverUrl,
      category,
      author: info.id,
    });

    // Return created post
    const populatedPost = await Post.findById(post._id)
      .populate('author', ['username']);
    
    return res.status(201).json(populatedPost);

  } catch (err) {
    console.error('Error creating post:', err);
    
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ 
      error: 'Could not create post',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
