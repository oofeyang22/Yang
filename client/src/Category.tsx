import React from 'react';
import { formatISO9075 } from 'date-fns';
import { Link } from 'react-router-dom';

interface Author {
  username: string;
}

interface CategoryProps {
  _id: string;
  title: string;
  summary: string;
  cover: string;
  createdAt: string;
  author: Author;
}

const Category: React.FC<CategoryProps> = ({ _id, title, summary, cover, createdAt, author }) => {
  return (
    <div className='post'>
      <div className='image'>
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/' + cover} alt="none" />
        </Link>
      </div>
      <div className='texts'>
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>

        <p className='info'>
          <a className='author'>{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
          {/*<time>{format(new Date(createdAt),'MMM d, yy HH:mm')}</time>*/}
        </p>
        <p className='summary'>{summary}</p>
      </div>
    </div>
  );
};

export default Category;