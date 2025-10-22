import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import NewMessageNotifier from '../Chat/NewMessageNotifier';

const MentorRedirect = ({ children }) => {
    const authContext = UserAuth();
    const { user, authLoading } = authContext || {};
    const navigate = useNavigate();
    const location = useLocation();
    const [mentorCheckLoading, setMentorCheckLoading] = useState(true);
    const [isMentor, setIsMentor] = useState(false);

    // Debug logging
    console.log('MentorRedirect - authContext:', authContext);
    console.log('MentorRedirect - user:', user);
    console.log('MentorRedirect - authLoading:', authLoading);

    useEffect(() => {
        const checkMentorStatus = async () => {
            if (user && user.email) {
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
                            if (isRegisteredMentor) {
                                setIsMentor(true);
                                if (!location.pathname.startsWith('/mentor')) {
                                    navigate('/mentor/dashboard', { replace: true });
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking mentor status:', error);
                } finally {
                    setMentorCheckLoading(false);
                }
            } else {
                setMentorCheckLoading(false);
            }
        };

        if (!authLoading) {
            checkMentorStatus();
        }
    }, [user, authLoading, navigate, location.pathname]);

    // Safety check for context
    if (!authContext) {
        console.warn('MentorRedirect: AuthContext is not available');
        return null;
    }

    if (authLoading || mentorCheckLoading) {
        return null; // Let the parent component handle loading
    }

    return (
        <>
            {children}
            {isMentor && <NewMessageNotifier />}
        </>
    );
};

export default MentorRedirect;
