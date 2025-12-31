/*
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Quill from '../Quill';

interface PostInfo {
  title: string;
  summary: string;
  content: string;
  category?: string;
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [redirect, setRedirect] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    fetch('/api/post-id?id=' + id)
      .then((response) => response.json())
      .then((postInfo: PostInfo) => {
        setTitle(postInfo.title);
        setSummary(postInfo.summary);
        setContent(postInfo.content);
        if (postInfo.category) {
          setCategory(postInfo.category);
        }
      })
      .catch((error) => {
        console.error('Error fetching post:', error);
      });
  }, [id]);

  async function updatePost(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    if (!id) {
      console.error('No post ID available');
      return;
    }

    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('category', category);
    data.set('content', content);
    data.set('id', id);

    if (files?.[0]) {
      data.set('file', files[0]);
    }

    try {
      const response = await fetch('/api/post-update/', {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });

      if (response.ok) {
        setRedirect(true);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  }

  if (redirect) {
    navigate('/post/' + id);
  }

  return (
    <form onSubmit={updatePost}>
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />

      <input
        type="text"
        placeholder="category"
        value={category}
        onChange={(ev) => setCategory(ev.target.value)}
      />

      <input
        type="text"
        placeholder="summary"
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      />

      <input
        type="file"
        onChange={(ev) => setFiles(ev.target.files)}
      />

      <Quill onChange={setContent} value={content} />

      <button style={{ marginTop: '3rem' }}>Edit Post</button>
    </form>
  );
};

export default EditPost;*/

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Quill from '../Quill';

interface PostInfo {
  title: string;
  summary: string;
  content: string;
  category?: string;
  cover?: string;
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>(''); // Store current cover URL
  const [redirect, setRedirect] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    fetch('/api/post-id?id=' + id)
      .then((response) => response.json())
      .then((postInfo: PostInfo) => {
        setTitle(postInfo.title);
        setSummary(postInfo.summary);
        setContent(postInfo.content);
        if (postInfo.category) {
          setCategory(postInfo.category);
        }
        if (postInfo.cover) {
          setCoverUrl(postInfo.cover); // Store current cover URL
        }
      })
      .catch((error) => {
        console.error('Error fetching post:', error);
      });
  }, [id]);

  async function updatePost(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError('');
    setIsUploading(true);

    if (!id) {
      setError('No post ID available');
      setIsUploading(false);
      return;
    }

    try {
      let updatedCoverUrl = coverUrl;

      // 1. Upload new image to Cloudinary if file is selected
      if (files?.[0]) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          throw new Error('Cloudinary configuration is missing');
        }

        const uploadFormData = new FormData();
        uploadFormData.append('file', files[0]);
        uploadFormData.append('upload_preset', uploadPreset);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: uploadFormData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to Cloudinary');
        }

        const uploadData = await uploadResponse.json();
        updatedCoverUrl = uploadData.secure_url;
      }

      // 2. Send updated post data to your backend
      const postData = {
        title,
        summary,
        content,
        category,
        ...(updatedCoverUrl && { coverUrl: updatedCoverUrl }), // Only send if exists
      };

      const response = await fetch('/api/post-update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...postData, id }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      // Success - redirect to post page
      setRedirect(true);

    } catch (err) {
      console.error('Error updating post:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  }

  if (redirect) {
    navigate('/post/' + id);
  }

  return (
    <form onSubmit={updatePost}>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
        required
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <input
        type="text"
        placeholder="category"
        value={category}
        onChange={(ev) => setCategory(ev.target.value)}
        required
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <input
        type="text"
        placeholder="summary"
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
        required
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      {/* Display current cover image if exists */}
      {coverUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <p>Current cover image:</p>
          <img 
            src={coverUrl} 
            alt="Current cover" 
            style={{ 
              maxWidth: '200px', 
              maxHeight: '150px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label>Update Cover Image (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(ev) => setFiles(ev.target.files)}
          style={{ marginTop: '0.5rem' }}
        />
        <small>Leave empty to keep current image</small>
      </div>

      <Quill onChange={setContent} value={content} />

      <button 
        style={{ 
          marginTop: '3rem', 
          padding: '0.75rem 2rem',
          backgroundColor: isUploading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isUploading ? 'not-allowed' : 'pointer'
        }}
        disabled={isUploading}
      >
        {isUploading ? 'Updating Post...' : 'Edit Post'}
      </button>
    </form>
  );
};

export default EditPost;