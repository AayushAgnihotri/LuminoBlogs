import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    limit, 
    getDocs, 
    updateDoc, 
    increment,
    orderBy,
    deleteDoc,
    setDoc,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FaHeart, FaRegHeart, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/BlogPost.css';

const BlogPost = ({ setIsHovering }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPost();
        if (currentUser?.uid) {
            checkUserInteractions();
        }
    }, [id, currentUser?.uid]);

    const fetchPost = async () => {
        try {
            const postDoc = await getDoc(doc(db, 'posts', id));
            if (postDoc.exists()) {
                const postData = {
                    id: postDoc.id,
                    ...postDoc.data(),
                    createdAt: postDoc.data().createdAt?.toDate?.() || new Date()
                };
                setPost(postData);
                fetchRelatedPosts(postData.category || 'General', postData.tags || []);
                fetchComments();
                // Update view count
                await updateDoc(doc(db, 'posts', id), {
                    views: increment(1)
                });
            } else {
                setError('Post not found');
                setLoading(false);
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Failed to load post');
            setLoading(false);
        }
    };

    const fetchRelatedPosts = async (category, tags) => {
        try {
            const relatedQuery = query(
                collection(db, 'posts'),
                where('category', '==', category),
                where('id', '!=', id),
                limit(3)
            );
            const snapshot = await getDocs(relatedQuery);
            const relatedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setRelatedPosts(relatedData);
        } catch (err) {
            console.error('Error fetching related posts:', err);
        }
    };

    const fetchComments = async () => {
        try {
            const commentsQuery = query(
                collection(db, 'posts', id, 'comments'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(commentsQuery);
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setComments(commentsData);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
        setLoading(false);
    };

    const checkUserInteractions = async () => {
        if (!currentUser?.uid) return;
        
        try {
            const likeDoc = await getDoc(doc(db, `posts/${id}/likes/${currentUser.uid}`));
            setLiked(likeDoc.exists());

            const bookmarkDoc = await getDoc(doc(db, `users/${currentUser.uid}/bookmarks/${id}`));
            setBookmarked(bookmarkDoc.exists());
        } catch (err) {
            console.error('Error checking user interactions:', err);
        }
    };

    const handleLike = async () => {
        if (!currentUser?.uid) {
            navigate('/login');
            return;
        }

        try {
            const likeRef = doc(db, `posts/${id}/likes/${currentUser.uid}`);
            const postRef = doc(db, 'posts', id);

            if (liked) {
                await deleteDoc(likeRef);
                await updateDoc(postRef, {
                    likes: increment(-1)
                });
            } else {
                await setDoc(likeRef, {
                    userId: currentUser.uid,
                    createdAt: serverTimestamp()
                });
                await updateDoc(postRef, {
                    likes: increment(1)
                });
            }

            setLiked(!liked);
        } catch (err) {
            console.error('Error updating like:', err);
        }
    };

    const handleBookmark = async () => {
        if (!currentUser?.uid) {
            navigate('/login');
            return;
        }

        try {
            const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${id}`);

            if (bookmarked) {
                await deleteDoc(bookmarkRef);
            } else {
                await setDoc(bookmarkRef, {
                    postId: id,
                    createdAt: serverTimestamp()
                });
            }

            setBookmarked(!bookmarked);
        } catch (err) {
            console.error('Error updating bookmark:', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!currentUser?.uid) {
            navigate('/login');
            return;
        }

        if (!commentText.trim()) return;

        try {
            const commentRef = collection(db, 'posts', id, 'comments');
            await addDoc(commentRef, {
                text: commentText,
                userId: currentUser.uid,
                userDisplayName: currentUser.displayName || 'Anonymous',
                userPhotoURL: currentUser.photoURL || null,
                createdAt: serverTimestamp()
            });

            setCommentText('');
            fetchComments();
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner" />
                <p className="neon-text">Loading amazing content...</p>
            </div>
        );
    }

    if (error) {
        return <div className="error neon-text">{error}</div>;
    }

    if (!post) return null;

    return (
        <motion.div
            className="blog-post-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <article className="blog-post glass-card">
                {post.coverImage && (
                    <div className="post-header-image">
                        <img src={post.coverImage} alt={post.title} loading="lazy" />
                    </div>
                )}
                
                <div className="post-content">
                    <div className="post-meta">
                        <div className="post-author">
                            <img
                                src={post.authorAvatar || '/default-avatar.png'}
                                alt={post.author}
                                className="author-avatar"
                                loading="lazy"
                            />
                            <span>{post.author}</span>
                        </div>
                        <span className="post-date">
                            {post.createdAt.toLocaleDateString()}
                        </span>
                    </div>

                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-body" dangerouslySetInnerHTML={{ __html: post.content }} />

                    <div className="post-actions">
                        <button
                            className={`action-button ${liked ? 'active' : ''}`}
                            onClick={handleLike}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {liked ? <FaHeart /> : <FaRegHeart />}
                            <span>{post.likes || 0}</span>
                        </button>
                        <button
                            className={`action-button ${bookmarked ? 'active' : ''}`}
                            onClick={handleBookmark}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                        <button
                            className="action-button"
                            onClick={() => {
                                navigator.share({
                                    title: post.title,
                                    text: post.excerpt,
                                    url: window.location.href
                                }).catch(console.error);
                            }}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <FaShare />
                        </button>
                    </div>
                </div>
            </article>

            <section className="comments-section glass-card">
                <h2>Comments</h2>
                <form onSubmit={handleComment} className="comment-form">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts..."
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    />
                    <button
                        type="submit"
                        disabled={!commentText.trim()}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        Post Comment
                    </button>
                </form>

                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment.id} className="comment glass-card">
                            <div className="comment-header">
                                <img
                                    src={comment.userPhotoURL || '/default-avatar.png'}
                                    alt={comment.userDisplayName}
                                    className="comment-avatar"
                                    loading="lazy"
                                />
                                <div className="comment-meta">
                                    <span className="comment-author">
                                        {comment.userDisplayName}
                                    </span>
                                    <span className="comment-date">
                                        {comment.createdAt.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {relatedPosts.length > 0 && (
                <section className="related-posts">
                    <h2>Related Posts</h2>
                    <div className="related-posts-grid">
                        {relatedPosts.map(relatedPost => (
                            <Link
                                key={relatedPost.id}
                                to={`/blog/${relatedPost.id}`}
                                className="related-post-card glass-card"
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                            >
                                {relatedPost.coverImage && (
                                    <img
                                        src={relatedPost.coverImage}
                                        alt={relatedPost.title}
                                        loading="lazy"
                                    />
                                )}
                                <div className="related-post-content">
                                    <h3>{relatedPost.title}</h3>
                                    <p>{relatedPost.excerpt}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </motion.div>
    );
};

export default BlogPost;
