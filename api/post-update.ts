/*
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDB } from '../server/db';
import Post from '../server/models/postModel';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';
import { uploadToCloudinary } from '../server/utils/cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface JWTPayload {
  id: string;
  [key: string]: any;
}

interface ParsedForm {
  fields: Fields;
  files: Files;
}

// Helper to parse form data
function parseForm(req: VercelRequest): Promise<ParsedForm> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req as any, (err: any, fields: Fields, files: Files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

// Safely extract filepath for both old and new Formidable versions
function getFilePath(file: File): string {
  return 'filepath' in file
    ? (file.filepath as string)
    : ((file as any).path as string);
}

// Helper to extract string from formidable field (could be string or array)
function getFieldValue(field: string | string[] | undefined): string {
  if (Array.isArray(field)) {
    return field[0] || '';
  }
  return field || '';
}

const SECRET = process.env.JWT_SECRET as string;

// Define category type to match Post model
type CategoryType = "Python" | "Javascript" | "React" | "Web Development" | "UI/UX Design";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectToDB();

    // Parse cookies
    let token: string | undefined;

    // Try different ways to get the token
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      try {
        const cookies = cookie.parse(req.headers.cookie);
        token = cookies.token;
      } catch {
        // Fallback to manual extraction
        const match = req.headers.cookie.match(/token=([^;]+)/);
        token = match ? match[1] : undefined;
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Verify JWT
    let info: JWTPayload;
    try {
      info = jwt.verify(token, SECRET) as JWTPayload;
    } catch (err) {
      console.error('JWT verification error:', err);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Parse form data
    const { fields, files } = await parseForm(req);
    
    // Extract values from fields (could be arrays)
    const id = getFieldValue(fields.id as string | string[]);
    const title = getFieldValue(fields.title as string | string[]);
    const summary = getFieldValue(fields.summary as string | string[]);
    const content = getFieldValue(fields.content as string | string[]);
    const categoryRaw = getFieldValue(fields.category as string | string[]);

    if (!id) {
      res.status(400).json({ error: 'Post ID required' });
      return;
    }

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Ensure the user is the author
    const isAuthor = String(post.author) === String(info.id);
    if (!isAuthor) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Handle optional file upload
    let coverUrl = post.cover;
    const uploadedFile = (files.file as File | File[] | undefined) || null;

    if (uploadedFile) {
      const fileObj = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
      const filePath = getFilePath(fileObj);

      try {
        const cloudResult = await uploadToCloudinary(filePath);
        coverUrl = cloudResult.secure_url;

        // remove local temp file
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Failed to delete temp file:', e);
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        res.status(500).json({ error: 'Failed to upload image' });
        return;
      }
    }

    // Validate and normalize category
    const validCategories: CategoryType[] = ['Python', 'Javascript', 'React', 'Web Development', 'UI/UX Design'];
    
    // Normalize category - handle case sensitivity
    let normalizedCategory = categoryRaw;
    if (categoryRaw.toLowerCase() === 'javascript') {
      normalizedCategory = 'Javascript'; // Capitalize to match enum
    } else if (categoryRaw) {
      // Find matching category case-insensitively
      const matchedCategory = validCategories.find(
        cat => cat.toLowerCase() === categoryRaw.toLowerCase()
      );
      if (matchedCategory) {
        normalizedCategory = matchedCategory;
      }
    }

    // Update post fields
    if (title) post.title = title;
    if (summary) post.summary = summary;
    if (content) post.content = content;
    if (coverUrl) post.cover = coverUrl;
    
    // Update category if provided and valid
    if (normalizedCategory) {
      // Validate against enum
      if (validCategories.includes(normalizedCategory as CategoryType)) {
        // Type assertion to tell TypeScript this is valid
        post.category = normalizedCategory as CategoryType;
      } else {
        res.status(400).json({ 
          error: 'Invalid category',
          validCategories,
          received: categoryRaw
        });
        return;
      }
    }

    await post.save();

    // Populate author info before sending response
    const populatedPost = await Post.findById(post._id).populate('author', ['username']);

    res.status(200).json(populatedPost);
  } catch (err: any) {
    console.error('Server error:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}*/

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDB } from '../server/db';
import Post from '../server/models/postModel';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { uploadToCloudinary } from '../server/utils/cloudinary';

export const config = {
  api: {
    bodyParser: true, // Changed from false to true to parse JSON
  },
};

interface JWTPayload {
  id: string;
  [key: string]: any;
}

interface UpdatePostRequest {
  id: string;
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  coverUrl?: string;
}

// Define category type to match Post model
type CategoryType = "Python" | "Javascript" | "React" | "Web Development" | "UI/UX Design";

const SECRET = process.env.JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await connectToDB();

    // Parse cookies
    let token: string | undefined;

    // Try different ways to get the token
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      try {
        const cookies = cookie.parse(req.headers.cookie);
        token = cookies.token;
      } catch {
        // Fallback to manual extraction
        const match = req.headers.cookie.match(/token=([^;]+)/);
        token = match ? match[1] : undefined;
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Verify JWT
    let info: JWTPayload;
    try {
      info = jwt.verify(token, SECRET) as JWTPayload;
    } catch (err) {
      console.error('JWT verification error:', err);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Parse JSON body
    const { id, title, summary, content, category, coverUrl } = req.body as UpdatePostRequest;

    if (!id) {
      res.status(400).json({ error: 'Post ID required' });
      return;
    }

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Ensure the user is the author
    const isAuthor = String(post.author) === String(info.id);
    if (!isAuthor) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Validate and normalize category if provided
    if (category) {
      const validCategories: CategoryType[] = ['Python', 'Javascript', 'React', 'Web Development', 'UI/UX Design'];
      
      // Normalize category - handle case sensitivity
      let normalizedCategory = category;
      if (category.toLowerCase() === 'javascript') {
        normalizedCategory = 'Javascript'; // Capitalize to match enum
      } else if (category) {
        // Find matching category case-insensitively
        const matchedCategory = validCategories.find(
          cat => cat.toLowerCase() === category.toLowerCase()
        );
        if (matchedCategory) {
          normalizedCategory = matchedCategory;
        }
      }

      // Validate against enum
      if (validCategories.includes(normalizedCategory as CategoryType)) {
        post.category = normalizedCategory as CategoryType;
      } else {
        res.status(400).json({ 
          error: 'Invalid category',
          validCategories,
          received: category
        });
        return;
      }
    }

    // Update post fields (only update if provided)
    if (title !== undefined) post.title = title;
    if (summary !== undefined) post.summary = summary;
    if (content !== undefined) post.content = content;
    
    // Update cover if a new URL is provided
    if (coverUrl !== undefined) {
      post.cover = coverUrl;
    }

    await post.save();

    // Populate author info before sending response
    const populatedPost = await Post.findById(post._id)
      .populate('author', ['username'])
      .select('-__v');

    res.status(200).json(populatedPost);
  } catch (err: any) {
    console.error('Server error:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}