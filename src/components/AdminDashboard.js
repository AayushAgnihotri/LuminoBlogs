import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import '../styles/AdminDashboard.css';
import { FiUsers, FiFileText, FiMessageSquare, FiImage, FiBell, FiSettings } from 'react-icons/fi';
import { HiOutlineChartBar } from 'react-icons/hi';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        activeUsers: 0
    });
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch users
            const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
            const usersSnapshot = await getDocs(usersQuery);
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
            setStats(prev => ({ ...prev, totalUsers: usersData.length }));

            // Fetch posts
            const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
            const postsSnapshot = await getDocs(postsQuery);
            const postsData = postsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            setStats(prev => ({ ...prev, totalPosts: postsData.length }));

            // Fetch comments
            const commentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsData = commentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
            setStats(prev => ({ ...prev, totalComments: commentsData.length }));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleUserStatusUpdate = async (userId, newStatus) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: newStatus
            });
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleUserRoleUpdate = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole
            });
            fetchDashboardData(); // Refresh data
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Chart data
    const userActivityData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Active Users',
                data: [65, 59, 80, 81, 56, 55],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const postAnalyticsData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Posts',
                data: [12, 19, 3, 5, 2, 3, 7],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
        ],
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="admin-layout" data-theme={theme}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>

                <nav className="nav-section">
                    <h3>Main</h3>
                    <ul className="nav-items">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <HiOutlineChartBar />
                                <span>Overview</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                                onClick={() => setActiveTab('users')}
                            >
                                <FiUsers />
                                <span>Users</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                <FiFileText />
                                <span>Posts</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('comments')}
                            >
                                <FiMessageSquare />
                                <span>Comments</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'media' ? 'active' : ''}`}
                                onClick={() => setActiveTab('media')}
                            >
                                <FiImage />
                                <span>Media</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                <nav className="nav-section">
                    <h3>Settings</h3>
                    <ul className="nav-items">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                <FiBell />
                                <span>Notifications</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                <FiSettings />
                                <span>Settings</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="admin-main">
                <div className="admin-header">
                    <div className="header-left">
                        <div className="breadcrumb">
                            <span>Dashboard</span>
                            <span>/</span>
                            <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="search-bar">
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Search..." />
                        </div>
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <>
                        <div className="dashboard-grid">
                            <div className="stat-card">
                                <h3>Total Users</h3>
                                <div className="value">{stats.totalUsers}</div>
                                <div className="trend up">
                                    <span>↑</span>
                                    <span>12% from last month</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Total Posts</h3>
                                <div className="value">{stats.totalPosts}</div>
                                <div className="trend up">
                                    <span>↑</span>
                                    <span>8% from last month</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Total Comments</h3>
                                <div className="value">{stats.totalComments}</div>
                                <div className="trend down">
                                    <span>↓</span>
                                    <span>3% from last month</span>
                                </div>
                            </div>
                        </div>

                        <div className="chart-container">
                            <h3>User Activity</h3>
                            <Line data={userActivityData} options={{ responsive: true }} />
                        </div>

                        <div className="chart-container">
                            <h3>Post Analytics</h3>
                            <Bar data={postAnalyticsData} options={{ responsive: true }} />
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="data-table">
                        <div className="table-header">
                            <h2 className="table-title">Users</h2>
                            <div className="table-actions">
                                <button className="filter-button">
                                    <i className="fas fa-filter"></i> Filter
                                </button>
                                <button className="add-button">
                                    <i className="fas fa-plus"></i> Add User
                                </button>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info">
                                                <img
                                                    src={user.photoURL || '/default-avatar.png'}
                                                    alt={user.displayName}
                                                />
                                                <div>
                                                    <div>{user.displayName}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="moderator">Moderator</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.status}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            {user.createdAt?.toDate().toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-button edit">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="action-button delete"
                                                    onClick={() => handleUserStatusUpdate(user.id, user.status === 'active' ? 'suspended' : 'active')}
                                                >
                                                    {user.status === 'active' ? (
                                                        <i className="fas fa-ban"></i>
                                                    ) : (
                                                        <i className="fas fa-check"></i>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <div className="page-info">
                                Showing 1-10 of {users.length} users
                            </div>
                            <div className="page-buttons">
                                <button className="page-button">Previous</button>
                                <button className="page-button active">1</button>
                                <button className="page-button">2</button>
                                <button className="page-button">3</button>
                                <button className="page-button">Next</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add similar sections for posts, comments, media, etc. */}
            </main>
        </div>
    );
};

export default AdminDashboard;
