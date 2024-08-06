import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Header.css';

const Header = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                // Create a simplified user object with only the needed properties
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || 'User',
                    photoURL: currentUser.photoURL || 'https://via.placeholder.com/40'
                });
                
                // Check if user is admin
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setIsAdmin(userDoc.data().role === 'admin');
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    if (loading) {
        return <div className="header-skeleton"></div>;
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="logo-section">
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <svg className="tech-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" className="logo-path-1" />
                                <path d="M2 17L12 22L22 17" className="logo-path-2" />
                                <path d="M2 12L12 17L22 12" className="logo-path-3" />
                            </svg>
                        </div>
                        <div className="logo-text">
                            <span className="lumino">Lumino</span>
                            <span className="blogs">Blogs</span>
                        </div>
                    </Link>
                </div>

                <nav className="main-nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/blogs" className="nav-link">Blogs</Link>
                    {user && <Link to="/write" className="nav-link">Write</Link>}
                    {isAdmin && (
                        <Link to="/admin" className="nav-link admin-link">
                            Admin
                        </Link>
                    )}
                </nav>

                <div className="auth-section">
                    {user ? (
                        <div className="user-profile">
                            <div className="user-menu" onClick={toggleMenu}>
                                <img 
                                    src={user.photoURL} 
                                    alt={user.displayName} 
                                    className="profile-image"
                                />
                                <span className="user-name">{user.displayName}</span>
                            </div>
                            {isMenuOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/dashboard" className="menu-item">
                                        Dashboard
                                    </Link>
                                    <Link to="/profile" className="menu-item">
                                        Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="menu-item">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button onClick={handleSignOut} className="menu-item sign-out">
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="auth-button login">
                                Login
                            </Link>
                            <Link to="/register" className="auth-button register">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
