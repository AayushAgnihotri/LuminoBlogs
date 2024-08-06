import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z\d]/)) strength += 1;
        setPasswordStrength(strength);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            
            // Add user data to Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                displayName: formData.fullName,
                email: formData.email,
                role: 'user',
                status: 'active',
                createdAt: serverTimestamp(),
                photoURL: null,
                bio: '',
                social: {
                    twitter: '',
                    github: '',
                    linkedin: ''
                }
            });

            // Update profile
            await updateProfile(userCredential.user, {
                displayName: formData.fullName
            });

            navigate('/dashboard');
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
                        <h1>Create Account</h1>
                        <p>Join our community of tech enthusiasts</p>
                    </div>
                    
                    <form onSubmit={handleRegister} className="auth-form">
                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                                <span className="input-highlight"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                                <span className="input-highlight"></span>
                            </div>
                            <div className="password-strength">
                                <div className="strength-bars">
                                    {[...Array(4)].map((_, index) => (
                                        <div
                                            key={index}
                                            className={`strength-bar ${index < passwordStrength ? 'active' : ''}`}
                                        ></div>
                                    ))}
                                </div>
                                <span className="strength-text">
                                    {passwordStrength === 0 && 'Weak'}
                                    {passwordStrength === 1 && 'Fair'}
                                    {passwordStrength === 2 && 'Good'}
                                    {passwordStrength === 3 && 'Strong'}
                                    {passwordStrength === 4 && 'Very Strong'}
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                                <span className="input-highlight"></span>
                            </div>
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
                                'Create Account'
                            )}
                        </button>

                        <div className="social-login">
                            <p>Or sign up with</p>
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
                        Already have an account? 
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>

                <div className="auth-right">
                    <div className="tech-background">
                        <div className="tech-circle"></div>
                        <div className="tech-circle"></div>
                        <div className="tech-circle"></div>
                    </div>
                    <div className="auth-content">
                        <h2>Welcome to Our Tech Community</h2>
                        <p>Start your journey of learning and sharing knowledge</p>
                        <div className="features-list">
                            <div className="feature-item">
                                <span>🚀</span>
                                <p>Access to exclusive tech content</p>
                            </div>
                            <div className="feature-item">
                                <span>👥</span>
                                <p>Connect with fellow developers</p>
                            </div>
                            <div className="feature-item">
                                <span>💡</span>
                                <p>Share your knowledge and experiences</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
