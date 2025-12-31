// Header.tsx
import React, { useState } from 'react' // Add useState import
import { Link } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import { UserContext } from './UserContext'; // Ensure this path is correct

// --- 1. Define the User Info Interface ---
// This should match the payload returned by your /api/profile endpoint
interface UserInfo {
  id: string; // Assuming an ID is present
  username: string;
  email: string;
  // Add any other properties your user object might have
}

// --- 2. Define the Context Value Interface ---
// This defines the shape of the object passed via the Context Provider
interface UserContextValue {
  userInfo: UserInfo | null; // It's null before fetching or when logged out
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  // If you had a 'ready' state or other properties, you'd add them here.
}

const Header: React.FC = () => {
  // 3. Type the useContext call using the interface
  const { setUserInfo, userInfo } = useContext(UserContext) as UserContextValue;
  
  // State for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    console.log('Fetching profile...');
    fetch('/api/profile', {
      credentials: 'include'
    }).then(response => {
      console.log('Profile response status:', response.status);
      if (response.ok) {
        response.json().then((userData: UserInfo) => {
          console.log('Profile data received:', userData);
          setUserInfo(userData);
        });
      } else {
        console.log('Profile fetch failed');
        setUserInfo(null);
      }
    }).catch(error => {
      console.error("Profile fetch error:", error);
      setUserInfo(null);
    });
  }, [setUserInfo]);

  // Logout Function
  async function logout() {
    await fetch('/api/logout', {
      credentials: 'include',
      method: 'POST'
    });
    // Assuming a successful logout should clear user info
    setUserInfo(null);
    // Close mobile menu after logout
    setIsMenuOpen(false);
  }

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu when clicking a link
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className='logo' onClick={closeMenu}>Yangy's Blog</Link>
      
      {/* Hamburger Menu Button */}
      <button 
        className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {/* Overlay for mobile menu */}
      <div 
        className={`overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      ></div>
      
      {/* Navigation - unchanged structure */}
      <nav className={isMenuOpen ? 'active' : ''}>
        {username && (
          <>
            <Link to='/create' onClick={closeMenu}>Create New Post</Link>
            {/* The 'a' tag needs a role="button" or should be replaced with a <button> for accessibility */}
            <a onClick={() => { logout(); closeMenu(); }} style={{cursor: 'pointer'}}>Logout ({username})</a> 
          </>
        )}
        {!username && (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;