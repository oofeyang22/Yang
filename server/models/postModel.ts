

import mongoose, { Schema } from 'mongoose';
import User from './userModel'; // Add this import
const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    cover: {
      type: String,
      required: false
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Python',
        'Javascript',
        'React',
        'Web Development',
        'UI/UX Design',
      ]
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    }
  },
  {
    timestamps: true
  }
);

PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', PostSchema);
export default Post;
