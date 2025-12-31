/*

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
  };
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);

  async function login(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Type assertion for the response
        const loginData = data as LoginResponse;
        
        // Update user context with user data
        setUserInfo(loginData.user);
        console.log('Login successful:', loginData.user);
        
        // Optional: Fetch profile immediately to ensure consistency
        try {
          const profileResponse = await fetch('/api/profile', {
            credentials: 'include'
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('Profile confirmed:', profileData);
          }
        } catch (profileError) {
          console.log('Profile fetch optional, using login data');
        }
        
        // Navigate to home
        navigate('/');
      } else {
        // Handle error response
        setError(data.message || data.error || 'Login failed');
        console.error('Login failed:', data);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={login} className='login'>
      <h1>Login</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <input
        type="text"
        placeholder='Username'
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        disabled={loading}
        required
        autoFocus
      />
      
      <input
        type="password"
        placeholder='Password'
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        disabled={loading}
        required
      />
      
      <button 
        type="submit" 
        disabled={loading}
        className={loading ? 'loading' : ''}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginPage;*/

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

interface LoginResponse {
  message: string;
  user: {
    _id: string;      // Changed from 'id' to '_id'
    username: string;
  };
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);

  async function login(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Type assertion for the response
        //const loginData = data as LoginResponse;
        
        // Debug log to see what we're getting
        //console.log('Login successful - user data:', loginData.user);
        
        // Update user context with user data
        //setUserInfo({
         // _id: loginData.user._id,
         // username: loginData.user.username
        //});
        
        // Navigate to home
        //navigate('/');

        const loginData = data;
  
  // Handle both _id and id cases
  const userId = loginData.user._id || loginData.user.id;
  
  if (!userId) {
    console.error('No user ID found in response:', loginData.user);
    setError('Login failed: No user ID received');
    return;
  }
  
  // Update user context
  setUserInfo({
    _id: userId,
    username: loginData.user.username
  });
    console.log('Login successful - user ID:', userId);
  navigate('/');
      } else {
        // Handle error response
        setError(data.message || data.error || 'Login failed');
        console.error('Login failed:', data);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={login} className='login'>
      <h1>Login</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <input
        type="text"
        placeholder='Username'
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
        disabled={loading}
        required
        autoFocus
      />
      
      <input
        type="password"
        placeholder='Password'
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        disabled={loading}
        required
      />
      
      <button 
        type="submit" 
        disabled={loading}
        className={loading ? 'loading' : ''}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginPage;