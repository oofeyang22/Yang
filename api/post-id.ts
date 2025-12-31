// api/post-id.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Post from '../server/models/postModel';
import { connectToDB } from '../server/db';
import { Types } from 'mongoose';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Connect to database
    await connectToDB();

    // Get ID from query parameters
    const { id } = req.query;

    // Validate ID
    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID provided' });
    }

    // Find post by ID
    const post = await Post.findById(id).populate('author', ['username']);

    // Handle not found
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Return post
    return res.status(200).json(post);

  } catch (err) {
    console.error('Error fetching post:', err);
    return res.status(500).json({ error: 'Failed fetching post' });
  }
}