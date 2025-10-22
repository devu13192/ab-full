import React, { useEffect, useState } from 'react'
import { UserAuth } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

const MentorProtected = ({ children }) => {
    const { user, authLoading } = UserAuth()
    const location = useLocation()
    const [isMentor, setIsMentor] = useState(false)
    const [mentorCheckLoading, setMentorCheckLoading] = useState(true)
    
    useEffect(() => {
        const checkMentorStatus = async () => {
            if (user && user.email) {
                try {
                    // Check if the user email matches the mentor email
                    if (user.email === 'edwinjoevarghese2026@mca.ajce.in') {
                        setIsMentor(true)
                    } else {
                        // Also check if they're registered as a mentor in the database
                        const response = await fetch('/mentor')
                        if (response.ok) {
                            const mentors = await response.json()
                            const isRegisteredMentor = mentors.some(mentor => 
                                mentor.email === user.email || 
                                mentor.credentials?.email === user.email
                            )
                            setIsMentor(isRegisteredMentor)
                        }
                    }
                } catch (error) {
                    console.error('Error checking mentor status:', error)
                    setIsMentor(false)
                } finally {
                    setMentorCheckLoading(false)
                }
            } else {
                setMentorCheckLoading(false)
            }
        }
        
        checkMentorStatus()
    }, [user])
    
    if (authLoading || mentorCheckLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f7f9fc'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        )
    }
    
    if (!user) {
        return <Navigate to="/" replace state={{ from: location }} />
    }
    
    if (!isMentor) {
        // Redirect to regular user dashboard if not a mentor
        return <Navigate to="/home" replace state={{ from: location }} />
    }
    
    return children
}

export default MentorProtected
