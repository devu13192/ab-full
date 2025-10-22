import React from 'react'
import { UserAuth } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

const AdminProtected = ({children}) => {
    const { user, authLoading } = UserAuth()
    const location = useLocation()
    if (authLoading) {
        return null
    }

    if (!user) {
        return <Navigate to="/" replace state={{ from: location }} />
    }

    const email = user?.email?.toLowerCase?.()
    const allowedAdmins = ['kudevupriya@gmail.com', 'devupriyaku2026@mca.ajce.in', 'devupriyaku2026@gmail.com']
    if (!allowedAdmins.includes(email)) {
        return <Navigate to="/home" />
    }

    return children
}

export default AdminProtected


