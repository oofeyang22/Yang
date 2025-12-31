import React, { useEffect, useState } from 'react';
import Post from '../Post';
import CatButtons from '../CatButtons';

interface Author {
  username: string;
}

interface PostType {
  _id: string;
  title: string;
  summary: string;
  content: string;
  cover: string;
  createdAt: string;
  author: Author;
}

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    fetch('api/posts', {method: 'GET'})
      .then((response) => response.json())
      .then((posts: PostType[]) => {
        setPosts(posts);
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });
  }, []);

  return (
    <div>
      <CatButtons />
      <div className='grid'>
        {posts.length > 0 &&
          posts.map((post) => (
            <div key={post._id}>
              <Post {...post} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default HomePage;