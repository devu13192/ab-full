import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import NewMessageNotifier from '../Chat/NewMessageNotifier';

const MentorRedirect = ({ children }) => {
    const authContext = UserAuth();
    const { user, authLoading } = authContext || {};
    const navigate = useNavigate();
    const location = useLocation();
    const [isMentor, setIsMentor] = useState(false);

    useEffect(() => {
        const checkMentorStatus = async () => {
            if (authLoading) {
                return;
            }

            if (!user?.email) {
                setIsMentor(false);
                return;
            }

            try {
                // Check if the user email matches the mentor email
                if (user.email === 'edwinjoevarghese2026@mca.ajce.in') {
                    setIsMentor(true);
                    // Allow any mentor sub-routes (e.g., /mentor/chat, /mentor/dashboard)
                    if (!location.pathname.startsWith('/mentor')) {
                        navigate('/mentor/dashboard', { replace: true });
                    }
                } else {
                    // Also check if they're registered as a mentor in the database
                    const response = await fetch('/mentor');
                    if (response.ok) {
                        const mentors = await response.json();
                        const isRegisteredMentor = mentors.some(mentor =>
                            mentor.email === user.email ||
                            mentor.credentials?.email === user.email
                        );
                        setIsMentor(isRegisteredMentor);
                        if (isRegisteredMentor && !location.pathname.startsWith('/mentor')) {
                            navigate('/mentor/dashboard', { replace: true });
                        }
                    } else {
                        setIsMentor(false);
                    }
                }
            } catch (error) {
                console.error('Error checking mentor status:', error);
                setIsMentor(false);
            }
        };

        checkMentorStatus();
    }, [user, authLoading, navigate, location.pathname]);

    // Safety check for context
    if (!authContext) {
        console.warn('MentorRedirect: AuthContext is not available');
        return children;
    }

    return (
        <>
            {children}
            {isMentor && <NewMessageNotifier />}
        </>
    );
};

export default MentorRedirect;
