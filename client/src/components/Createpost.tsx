/*
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Quill from '../Quill';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState<string>('');
  const [redirect, setRedirect] = useState<boolean>(false);
  const navigate = useNavigate();

  async function createNewPost(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    if (!files || files.length === 0) {
      console.error('No file selected');
      return;
    }

    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('category', category);
    data.set('file', files[0]);

    const response = await fetch('/api/posts', {
      method: 'POST',
      body: data,
      credentials: 'include',
    });

    if (response.ok) {
      setRedirect(true);
    }

    if (redirect) {
      navigate('/');
    }
  }

  return (
    <form onSubmit={createNewPost}>
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

      <Quill value={content} onChange={setContent} />

      <button style={{ marginTop: '3rem' }}>Create Post</button>
    </form>
  );
};

export default CreatePost;*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Quill from '../Quill';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  async function createNewPost(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError('');
    setIsUploading(true);

    // Validate required fields
    if (!title || !summary || !content || !category) {
      setError('Please fill in all required fields');
      setIsUploading(false);
      return;
    }

    try {
      let coverUrl = '';

      // 1. Upload to Cloudinary if file exists
      if (files && files.length > 0) {
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
        coverUrl = uploadData.secure_url;
      }

      // 2. Send post data to your backend
      const postData = {
        title,
        summary,
        content,
        category,
        coverUrl,
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      // Success - redirect to home
      navigate('/');

    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={createNewPost}>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Title *"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
        required
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <input
        type="text"
        placeholder="Category *"
        value={category}
        onChange={(ev) => setCategory(ev.target.value)}
        required
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <input
        type="text"
        placeholder="Summary *"
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
        required
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <div style={{ marginBottom: '1rem' }}>
        <label>Cover Image (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(ev) => setFiles(ev.target.files)}
          style={{ marginTop: '0.5rem' }}
        />
      </div>

      <Quill value={content} onChange={setContent} />

      <button 
        type="submit" 
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
        {isUploading ? 'Creating Post...' : 'Create Post'}
      </button>
    </form>
  );
};

export default CreatePost;