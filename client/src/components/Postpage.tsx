import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatISO9075 } from 'date-fns';
import { UserContext } from '../UserContext';

interface Author {
  _id: string;
  username: string;
}

interface PostInfo {
  _id: string;
  title: string;
  content: string;
  cover: string;
  createdAt: string;
  author: Author;
  category?: string;
  summary?: string;
}

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userInfo } = useContext(UserContext);

  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post-id?id=${id}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPostInfo(data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div className="post-page">Loading...</div>;
  }

  if (error || !postInfo) {
    return (
      <div className="post-page error">
        <p>{error}</p>
        <Link to="/">← Back</Link>
      </div>
    );
  }

  return (
    <div className="post-page">
      <article className="post-content">
        <header className="post-header">
          <h1 className="post-title">{postInfo.title}</h1>

          <div className="post-meta">
            <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
            <span> · @{postInfo.author.username}</span>
          </div>

          {postInfo.summary && (
            <p className="post-summary">{postInfo.summary}</p>
          )}
        </header>

        {postInfo.cover && (
          <figure className="post-image">
            {postInfo.category && (
              <span className="image-category">
                {postInfo.category}
              </span>
            )}

            <img
              src={postInfo.cover}
              alt={postInfo.title}
              className="featured-image"
            />

            <figcaption className="image-caption">
              {postInfo.title} – Featured Image
            </figcaption>
          </figure>
        )}

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: postInfo.content }}
        />
        
        {userInfo?._id === postInfo.author._id && (
          <div className="edit-row">
            <Link to={`/edit/${postInfo._id}`} className="edit-btn">
              Edit post
            </Link>
          </div>
        )}

        <footer className="post-footer">
          <Link to="/" className="back-to-home">
            ← Back to all posts
          </Link>
        </footer>
      </article>
    </div>
  );
};

export default PostPage;
