import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import "./Interview.css"
import SpeechRecognition from '../../components/SpeechRecognition/SpeechRecognition'
import { Business, Work, ArrowBack } from '@mui/icons-material'
import { Link } from 'react-router-dom'

const Interview = () => {
    const {id} = useParams()
    const [details, setDetails] = useState({})
    const [botTalking, setBotTalking] = useState(false)
    
    useEffect(() => {
        document.title = "EIRA - Mock Interview"
        axios.get(`/interview/${id}`)
            .then(response => {
                setDetails(response.data)
            })
    }, [id])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    }
    
    return (
        <motion.div 
            className='interview-bot-container'
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header Section */}
            <motion.div className='interview-header' variants={itemVariants}>
                <div className='interview-details'>
                    <div className='company-info'>
                        <div className='info-item'>
                            <Business className='info-icon' />
                            <div className='info-content'>
                                <span className='info-label'>Company</span>
                                <span className='info-value'>{details.company}</span>
                            </div>
                        </div>
                        <div className='info-item'>
                            <Work className='info-icon' />
                            <div className='info-content'>
                                <span className='info-label'>Role</span>
                                <span className='info-value'>{details.role}</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/home" className='back-button'>
                        <ArrowBack />
                        Back to Dashboard
                    </Link>
                </div>
            </motion.div>

            {/* Main Interview Interface */}
            <motion.div className='interview-main' variants={itemVariants}>
                <SpeechRecognition setBotTalking={setBotTalking} botTalking={botTalking} />
            </motion.div>
        </motion.div>
    )
}

export default Interview
