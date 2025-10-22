import React, { useEffect, useState } from 'react'
import { UserAuth } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import axios from 'axios'
const Protected = ({children}) => {
    const {user, authLoading}  = UserAuth()
    const location = useLocation()
    const [userStatusChecked, setUserStatusChecked] = useState(false)
    const [isDeactivated, setIsDeactivated] = useState(false)
    
    useEffect(() => {
        const checkUserStatus = async () => {
            if (user && user.uid) {
                try {
                    const response = await axios.get(`/user/${user.uid}`)
                    if (response.data.deactivated || !response.data.active) {
                        setIsDeactivated(true)
                    }
                } catch (error) {
                    console.error('Error checking user status:', error)
                } finally {
                    setUserStatusChecked(true)
                }
            } else {
                setUserStatusChecked(true)
            }
        }
        
        checkUserStatus()
    }, [user])
    
    if (authLoading || !userStatusChecked) {
        return null
    }
    
    if (!user) {
        return <Navigate to="/" replace state={{ from: location }} />
    }
    
    if (isDeactivated) {
        return <Navigate to="/" replace state={{ from: location }} />
    }
    
    return children
}

export default Protected
