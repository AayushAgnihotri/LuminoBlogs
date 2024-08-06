import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setIsAdmin(userDoc.data().role === 'admin');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
            setLoading(false);
        };

        checkAdminStatus();
    }, [currentUser]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentUser || !isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};
