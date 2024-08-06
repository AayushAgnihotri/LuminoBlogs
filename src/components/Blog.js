import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';
import '../styles/Blog.css';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="blog-container">
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <Link to={`/blogs/${post.id}`} className="post-link">
              {post.coverImage && <img src={post.coverImage} alt="Cover" className="post-cover-image" />}
              <h2 className="post-title">{post.title}</h2>
              <p className="post-excerpt">{post.excerpt}</p>
              <div className="post-meta">
                <span className="post-author">{post.author.name}</span>
                <span className="post-date">{new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Blog;
