import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../services/firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        posts: 0,
        followers: 0,
        following: 0,
        likes: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [draftPosts, setDraftPosts] = useState([]);
    const [publishedPosts, setPublishedPosts] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserData(currentUser.uid);
            } else {
                navigate('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchUserData = async (userId) => {
        try {
            // Fetch user's posts
            const postsQuery = query(
                collection(db, 'posts'),
                where('authorId', '==', userId)
            );
            const postsSnapshot = await getDocs(postsQuery);
            
            const published = [];
            const drafts = [];
            let totalLikes = 0;

            postsSnapshot.forEach((doc) => {
                const post = { id: doc.id, ...doc.data() };
                if (post.status === 'published') {
                    published.push(post);
                    totalLikes += post.likes || 0;
                } else {
                    drafts.push(post);
                }
            });

            setPublishedPosts(published);
            setDraftPosts(drafts);

            // Fetch user's stats
            const userStatsDoc = await getDocs(doc(db, 'userStats', userId));
            if (userStatsDoc.exists()) {
                setUserStats({
                    posts: published.length,
                    followers: userStatsDoc.data().followers || 0,
                    following: userStatsDoc.data().following || 0,
                    likes: totalLikes
                });
            }

            // Fetch recent activity
            const activityQuery = query(
                collection(db, 'activity'),
                where('userId', '==', userId),
                where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            );
            const activitySnapshot = await getDocs(activityQuery);
            const activities = [];
            
            activitySnapshot.forEach((doc) => {
                activities.push({ id: doc.id, ...doc.data() });
            });

            setRecentActivity(activities);

        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const storageRef = ref(storage, `profile_images/${user.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Update auth profile
            await updateProfile(auth.currentUser, {
                photoURL: downloadURL
            });

            // Update user document in Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                photoURL: downloadURL
            });

            setUser({ ...user, photoURL: downloadURL });
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="user-profile">
                    <div className="profile-image-container">
                        <img 
                            src={user?.photoURL || 'https://via.placeholder.com/200'} 
                            alt="User profile" 
                            className="profile-image" 
                        />
                        <label className="edit-profile-button" aria-label="Edit profile picture">
                            {uploadingImage ? '⌛' : '📷'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <h2>{user?.displayName || 'User'}</h2>
                    <p className="user-bio">{user?.email}</p>
                </div>

                <nav className="dashboard-nav">
                    <button 
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        📝 My Posts ({publishedPosts.length})
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'drafts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('drafts')}
                    >
                        📋 Drafts ({draftPosts.length})
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'write' ? 'active' : ''}`}
                        onClick={() => navigate('/write')}
                    >
                        ✍️ Write New Post
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        📈 Analytics
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙️ Settings
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">📝</span>
                        <div className="stat-content">
                            <h3>{userStats.posts}</h3>
                            <p>Posts</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">👥</span>
                        <div className="stat-content">
                            <h3>{userStats.followers}</h3>
                            <p>Followers</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🤝</span>
                        <div className="stat-content">
                            <h3>{userStats.following}</h3>
                            <p>Following</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">❤️</span>
                        <div className="stat-content">
                            <h3>{userStats.likes}</h3>
                            <p>Total Likes</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <span className="activity-icon">
                                        {activity.type === 'post' ? '📝' : 
                                         activity.type === 'comment' ? '💬' : '❤️'}
                                    </span>
                                    <div className="activity-content">
                                        <h3>{activity.title}</h3>
                                        <p>{new Date(activity.timestamp?.toDate()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-activity">No recent activity</p>
                        )}
                    </div>
                </section>

                {/* Content based on active tab */}
                {activeTab === 'posts' && (
                    <section className="posts-section">
                        <h2>Published Posts</h2>
                        <div className="posts-grid">
                            {publishedPosts.map((post) => (
                                <div key={post.id} className="post-card">
                                    <h3>{post.title}</h3>
                                    <div className="post-stats">
                                        <span>👁️ {post.views || 0}</span>
                                        <span>❤️ {post.likes || 0}</span>
                                        <span>💬 {post.comments || 0}</span>
                                    </div>
                                    <button 
                                        className="edit-button"
                                        onClick={() => navigate(`/edit/${post.id}`)}
                                    >
                                        Edit Post
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'drafts' && (
                    <section className="drafts-section">
                        <h2>Draft Posts</h2>
                        <div className="drafts-grid">
                            {draftPosts.map((draft) => (
                                <div key={draft.id} className="draft-card">
                                    <h3>{draft.title}</h3>
                                    <p>Last edited: {new Date(draft.lastEdited?.toDate()).toLocaleDateString()}</p>
                                    <div className="draft-actions">
                                        <button 
                                            className="edit-button"
                                            onClick={() => navigate(`/edit/${draft.id}`)}
                                        >
                                            Continue Editing
                                        </button>
                                        <button className="publish-button">
                                            Publish
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'analytics' && (
                    <section className="analytics-section">
                        <h2>Analytics</h2>
                        <p>Coming soon...</p>
                    </section>
                )}

                {activeTab === 'settings' && (
                    <section className="settings-section">
                        <h2>Settings</h2>
                        <p>Coming soon...</p>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
