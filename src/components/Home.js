import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('views', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured posts:', error);
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Welcome to BloggingWeb</h1>
        <p>Discover stories, thinking, and expertise from writers on any topic.</p>
        <Link to="/blogs" className="start-reading-btn">
          Start Reading
        </Link>
      </section>

      <section className="featured-section">
        <h2>Featured Posts</h2>
        <div className="featured-posts">
          {featuredPosts.map(post => (
            <div key={post.id} className="featured-post-card">
              <Link to={`/blog/${post.id}`}>
                <h3>{post.title}</h3>
              </Link>
              <p>{post.excerpt}</p>
              <div className="post-meta">
                <span>{post.author?.name || 'Anonymous'}</span>
                <span>{new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Start Writing</h2>
        <p>Share your ideas with millions of readers.</p>
        <Link to="/write" className="start-writing-btn">
          Start Writing
        </Link>
      </section>
    </div>
  );
}

export default Home;
