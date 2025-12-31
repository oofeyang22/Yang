// api/post-category.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDB } from '../server/db';
import Post from '../server/models/postModel';

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

    // Get category from query parameters
    const { category } = req.query;

    // Validate category parameter
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category parameter is required and must be a string' });
    }

    // Find posts by category
    const posts = await Post.find({ category })
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);

    // Return posts
    return res.status(200).json(posts);

  } catch (err) {
    console.error('Error fetching posts by category:', err);
    return res.status(500).json({ error: 'Failed fetching posts by category' });
  }
}
