import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { formatISO9075 } from 'date-fns';

interface Author {
  username: string;
  _id?: string;
}

interface Post {
  _id: string;
  title: string;
  cover: string;
  summary?: string;
  createdAt: string;
  author?: Author;
  category?: string;
}

const PostsByCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [decodedCategory, setDecodedCategory] = useState<string>('');

  // Helper function to optimize Cloudinary image URL
  const optimizeCloudinaryImage = (url: string, width: number = 400) => {
    if (!url) return '/placeholder-image.jpg';
    
    // Check if it's a Cloudinary URL
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        // Apply transformations: auto format, auto quality, specific width, crop limit
        const transformations = `f_auto,q_auto:good,w_${width},c_limit`;
        return `${parts[0]}/upload/${transformations}/${parts[1]}`;
      }
    }
    
    // Return original URL if not Cloudinary
    return url;
  };

  // Helper to generate responsive srcSet for Cloudinary images
  const getCloudinarySrcSet = (url: string) => {
    if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
      return url;
    }

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const sizes = [
      { width: 200, descriptor: '200w' },
      { width: 400, descriptor: '400w' },
      { width: 600, descriptor: '600w' },
      { width: 800, descriptor: '800w' },
    ];

    return sizes
      .map(({ width, descriptor }) => 
        `${parts[0]}/upload/f_auto,q_auto,w_${width},c_limit/${parts[1]} ${descriptor}`
      )
      .join(', ');
  };

  // Function to safely decode URL parameter
  const decodeCategoryParam = (cat: string | undefined): string => {
    if (!cat) return '';
    try {
      return decodeURIComponent(cat);
    } catch {
      return cat;
    }
  };

  useEffect(() => {
    const decoded = decodeCategoryParam(category);
    setDecodedCategory(decoded);
  }, [category]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!decodedCategory) return;

      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching posts for category: ${decodedCategory}`);
        
        // Correct API endpoint - adjust based on your actual API
        const response = await axios.get<Post[]>(
          `/api/post-category?category=${encodeURIComponent(decodedCategory)}`
        );
        
        console.log('API Response:', response.data);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to fetch posts: ${errorMessage}`);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [decodedCategory]);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="category-page loading">
        <div className="loading-header">
          <div className="loading-title skeleton"></div>
        </div>
        <div className="category-posts">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="post-skeleton">
              <div className="image-skeleton skeleton"></div>
              <div className="content-skeleton">
                <div className="title-skeleton skeleton"></div>
                <div className="meta-skeleton skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="category-page error">
        <h2>Error Loading Posts</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </div>
    );
  }

  // No posts found
  if (posts.length === 0 && !loading) {
    return (
      <div className="category-page empty">
        <h2>Posts in "{decodedCategory}"</h2>
        <div className="empty-state">
          <p>No posts found in this category yet.</p>
          <Link to="/" className="browse-link">
            Browse all posts
          </Link>
          <Link to="/create" className="create-link">
            Create the first post in this category
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <header className="category-header">
        <h1 className="category-title">
          Posts in <span className="category-name">"{decodedCategory}"</span>
        </h1>
        <div className="category-stats">
          <span className="post-count">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      <div className="category-posts">
        {posts.map((post) => {
          const optimizedImage = optimizeCloudinaryImage(post.cover, 600);
          const imageSrcSet = getCloudinarySrcSet(post.cover);

          return (
            <article key={post._id} className="category-post">
              <Link to={`/post/${post._id}`} className="post-link">
                <div className="post-image-container">
                  <img
                    src={optimizedImage}
                    srcSet={imageSrcSet}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    alt={post.title}
                    loading="lazy"
                    className="post-image"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                      e.currentTarget.onerror = null;
                    }}
                  />
                  {post.category && (
                    <span className="post-category-badge">{post.category}</span>
                  )}
                </div>
                
                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  
                  {post.summary && (
                    <p className="post-summary">{post.summary}</p>
                  )}
                  
                  <div className="post-meta">
                    <div className="post-author">
                      {post.author?.username ? (
                        <>
                          <span className="author-avatar">
                            {post.author.username.charAt(0).toUpperCase()}
                          </span>
                          <span className="author-name">@{post.author.username}</span>
                        </>
                      ) : (
                        <span className="anonymous-author">Anonymous</span>
                      )}
                    </div>
                    
                    <time className="post-date" dateTime={post.createdAt}>
                      {formatISO9075(new Date(post.createdAt))}
                    </time>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default PostsByCategory;