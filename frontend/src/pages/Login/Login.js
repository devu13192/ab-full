import React, {useEffect, useState} from 'react';
import {  useNavigate } from 'react-router-dom'
import {GoogleButton} from "react-google-button"
import { UserAuth} from '../../context/AuthContext';
import { Alert, CircularProgress, Box } from '@mui/material';
import "./Login.css"
const Login = () => {
    const navigate = useNavigate()
    const {googleSignin,user,authLoading}  = UserAuth()
    const [loginLoading, setLoginLoading] = useState(false)
    const [loginError, setLoginError] = useState('')
    
    const handleGoogleSignin = async ()=>{
        try {
            setLoginLoading(true)
            setLoginError('')
            await googleSignin();
        } catch (error) {
            console.log(error);
            setLoginError('Login failed. Please try again.')
        } finally {
            setLoginLoading(false)
        }
    }
    useEffect(()=>{
        document.title = 'Login'
      },[])
    useEffect(()=>{
        if(user != null){
            const email = user?.email?.toLowerCase?.()
            const allowedAdmins = ['kudevupriya@gmail.com', 'devupriyaku2026@mca.ajce.in']
            const mentorEmail = 'edwinjoevarghese2026@mca.ajce.in'
            
            if(allowedAdmins.includes(email)){
                const adminUrl = process.env.REACT_APP_ADMIN_URL
                if(adminUrl){
                    window.location.replace(adminUrl)
                } else {
                    navigate('/admin')
                }
            } else if(email === mentorEmail.toLowerCase()){
                // Redirect mentor directly to dashboard
                navigate('/mentor/dashboard')
            } else {
                navigate('/home')
            }
        }
    },[user,navigate])
    return(
        <>
        <div className='login-container'>
                <div className="login-photo" style={{ backgroundImage: "url('/p5.jpg')" }} />
                <h1 className="section-title">Ready to get started?</h1>
                <h3 className="section-subtitle">Login using your college mail id</h3>
                
                {loginError && (
                    <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
                        {loginError}
                    </Alert>
                )}
                
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <GoogleButton 
                        onClick={handleGoogleSignin}
                        disabled={loginLoading || authLoading}
                    />
                    {(loginLoading || authLoading) && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1,
                            }}
                        >
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Box>
                
                <h3>PS : Our services are only available for students of AJCE right now due to scalability issues.</h3>
        </div>
        </>
    )
}
 
export default Login
