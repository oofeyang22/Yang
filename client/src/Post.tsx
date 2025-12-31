

import React, { useEffect, useState } from 'react';
import { formatISO9075 } from 'date-fns';
import { Link } from 'react-router-dom';

interface Author {
  username: string;
  _id?: string;
  avatar?: string;
}

interface PostProps {
  _id: string;
  title: string;
  summary: string;
  cover: string;
  createdAt: string;
  author: Author;
  category?: string;
  readTime?: number;
}

// Cloudinary utility functions
const cloudinaryUtils = {
  // Optimize Cloudinary image URL with transformations
  optimizeImage: (url: string, width: number = 600): string => {
    if (!url) {
      return '/placeholder-image.jpg';
    }

    // If it's already a Cloudinary URL, apply optimizations
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        // Apply transformations: auto format, auto quality, specific width, crop limit
        const transformations = `f_auto,q_auto:best,w_${width},c_fill,g_auto`;
        return `${parts[0]}/upload/${transformations}/${parts[1]}`;
      }
    }

    // If it's a local path (from old setup), convert to proper URL
    if (url.startsWith('/uploads/')) {
      // Remove leading slash for proper URL construction
      const cleanPath = url.replace(/^\//, '');
      return `${import.meta.env.VITE_API_URL || ''}/${cleanPath}`;
    }

    // Return as-is for external URLs
    return url;
  },

  // Generate responsive srcSet for Cloudinary images
  getSrcSet: (url: string): string => {
    if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
      return url;
    }

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const sizes = [
      { width: 300, descriptor: '300w' },
      { width: 600, descriptor: '600w' },
      { width: 900, descriptor: '900w' },
      { width: 1200, descriptor: '1200w' },
    ];

    return sizes
      .map(({ width, descriptor }) => 
        `${parts[0]}/upload/f_auto,q_auto,w_${width},c_fill,g_auto/${parts[1]} ${descriptor}`
      )
      .join(', ');
  },

  // Generate placeholder for lazy loading (tiny blurred image)
  getPlaceholder: (url: string): string => {
    if (!url || !url.includes('cloudinary.com') || !url.includes('/upload/')) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+';
    }

    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // Generate a tiny, blurred placeholder (10px wide, low quality)
      return `${parts[0]}/upload/e_blur:100,q_1,w_10/${parts[1]}`;
    }

    return url;
  }
};

const Post: React.FC<PostProps> = ({ 
  _id, 
  title, 
  summary, 
  cover, 
  createdAt, 
  author, 
  category,
  readTime = 3 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Optimize the main image URL
  const optimizedImage = cloudinaryUtils.optimizeImage(cover, 600);
  const imageSrcSet = cloudinaryUtils.getSrcSet(cover);
  const placeholder = cloudinaryUtils.getPlaceholder(cover);

  // Calculate read time based on summary length (approximate)
  const calculatedReadTime = Math.max(
    1,
    Math.ceil(summary.split(/\s+/).length / 200)
  );
  const finalReadTime = readTime ?? calculatedReadTime;
  // Format date for better readability
  const formattedDate = formatISO9075(new Date(createdAt));

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };
  
useEffect(() => {
  // Simulate loading for 500ms then show content
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);

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

  return (
    <article className="post-card">
      {/* Image Container */}
      <div className="post-image-container">
        <Link to={`/post/${_id}`} className="image-link" aria-label={`Read ${title}`}>
          <div className="image-wrapper">
            {/* Placeholder/Loading state */}
            {!imageLoaded && !imageError && (
              <div 
                className="image-placeholder"
                style={{ 
                  backgroundImage: `url(${placeholder})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}
            
            {/* Main Image */}
            <img
              src={imageError ? '/placeholder-image.jpg' : optimizedImage}
              srcSet={!imageError ? imageSrcSet : undefined}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              alt={title}
              loading="lazy"
              className={`post-image ${imageLoaded ? 'loaded' : 'loading'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
            
            {/* Category badge */}
            {category && (
              <span className="post-category">{category}</span>
            )}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="post-content">
        <header className="post-header">
          <Link to={`/post/${_id}`} className="post-title-link">
            <h2 className="post-title">{title}</h2>
          </Link>
          
          {/* Meta information */}
          <div className="post-meta">
            <div className="author-info">
              {author.avatar ? (
                <img 
                  src={cloudinaryUtils.optimizeImage(author.avatar, 40)} 
                  alt={author.username}
                  className="author-avatar"
                />
              ) : (
                <div className='author'>
                <div className="author-avatar-initial">
                  {author.username?.charAt(0).toUpperCase() || 'A'}

                </div>
                <span className="author-name">@{author.username}</span>
                </div>

              )}
              <div className="author-details">

                <div className="meta-details">
                  <time dateTime={createdAt} className="post-date">
                    {formattedDate}
                  </time>
                  <span className="read-time">· {finalReadTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Summary */}
        <div className="post-summary-container">
          <p className="post-summary">{summary}</p>
          <Link to={`/post/${_id}`} className="read-more">
            Read more →
          </Link>
        </div>

        {/* Footer with tags/interactions */}
        <footer className="post-footer">
          <div className="post-tags">
            {category && (
              <Link to={`/category/${category}`} className="post-tag">
                #{category}
              </Link>
            )}
          </div>
          
          <div className="post-actions">
            <button className="bookmark-btn" aria-label="Bookmark this post">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default Post;


