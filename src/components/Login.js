import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.status === 'suspended') {
                    throw new Error('Your account has been suspended. Please contact support.');
                }
                
                // Check user role and redirect accordingly
                if (userData.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                throw new Error('User data not found');
            }
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-left">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Enter your credentials to access your account</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="form-input"
                                />
                                <span className="input-highlight"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="form-input"
                                />
                                <span className="input-highlight"></span>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-password">
                                Forgot Password?
                            </Link>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button 
                            type="submit" 
                            className={`auth-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Login'
                            )}
                        </button>

                        <div className="social-login">
                            <p>Or continue with</p>
                            <div className="social-buttons">
                                <button type="button" className="social-button google">
                                    <span>G</span>
                                </button>
                                <button type="button" className="social-button github">
                                    <span>Git</span>
                                </button>
                                <button type="button" className="social-button twitter">
                                    <span>𝕏</span>
                                </button>
                            </div>
                        </div>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? 
                        <Link to="/register" className="auth-link">Sign up</Link>
                    </p>
                </div>

                <div className="auth-right">
                    <div className="tech-background">
                        <div className="tech-circle"></div>
                        <div className="tech-circle"></div>
                        <div className="tech-circle"></div>
                    </div>
                    <div className="auth-content">
                        <h2>Join Our Tech Community</h2>
                        <p>Share your knowledge, learn from others, and grow together</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
