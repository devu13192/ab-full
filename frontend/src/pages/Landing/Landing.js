import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import "./Landing.css";
import ProfessionalNavbar from "../../components/Navbar/ProfessionalNavbar";
import { Link } from "react-router-dom";
import { 
  Mic, 
  Psychology, 
  Analytics, 
  Security, 
  PlayArrow, 
  Star,
  TrendingUp,
  People,
  School,
  Work,
  CheckCircle,
  Speed,
  AutoAwesome,
  BusinessCenter
} from '@mui/icons-material'

const Landing = () => {
  const [currentTagline, setCurrentTagline] = useState(0);
  
  const taglines = [
    "AI-Powered",
    "Intelligent", 
    "Professional",
    "Interview Platform"
  ];

  useEffect(() => {
    document.title = 'EIRA - AI-Powered Interview Preparation Platform';
    
    // Rotating tagline effect
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

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
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const floatingVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  }

  const features = [
    {
      icon: <Mic />,
      title: "Advanced Speech Recognition",
      description: "State-of-the-art speech-to-text technology that captures every detail of your interview responses with exceptional accuracy and clarity.",
      color: "var(--primary-500)"
    },
    {
      icon: <Psychology />,
      title: "Intelligent AI Analysis", 
      description: "Sophisticated natural language processing that evaluates your responses and provides detailed insights on communication skills and technical knowledge.",
      color: "var(--secondary-500)"
    },
    {
      icon: <Analytics />,
      title: "Comprehensive Analytics",
      description: "Detailed performance metrics and actionable recommendations that help you identify strengths and areas for improvement.",
      color: "var(--accent-500)"
    },
    {
      icon: <Security />,
      title: "Enterprise Security",
      description: "Bank-level security with advanced authentication, encrypted data transmission, and comprehensive privacy protection for your peace of mind.",
      color: "var(--success-500)"
    },
    {
      icon: <TrendingUp />,
      title: "Progress Tracking",
      description: "Visualize improvement over time with trend charts, scores, and session comparisons to keep you motivated and on track.",
      color: "var(--primary-600)"
    },
    {
      icon: <BusinessCenter />,
      title: "Role-Based Templates",
      description: "Instantly start with curated question sets tailored for roles and industries like SWE, Data, PM, and more.",
      color: "var(--secondary-600)"
    }
  ]


  return (
    <>
      <ProfessionalNavbar />
      <div className="landing-scroll">
      {/* Hero Section - Modern SaaS two-column layout */}
      <motion.section 
        className="hero-section snap"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="section-photo" style={{ backgroundImage: "url('/p6.jpg')" }} />
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles"></div>
        </div>

        <div className="hero-container">
          <div className="hero-grid">
            <motion.div className="hero-left" variants={itemVariants}>
              <div className="hero-content">
                <motion.div className="hero-badge" variants={itemVariants}>
                  <motion.span 
                    className="hero-badge-text"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <motion.span 
                      className="badge-icon"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <School />
                    </motion.span>
                    For Amal Jyothi College Students
                  </motion.span>
                </motion.div>

                <motion.h1 className="hero-title">
                  <motion.span 
                    className="title-line-1"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    Excel in Your Next
                  </motion.span>
                  {' '}
                  <motion.span 
                    className="gradient-text title-line-2"
                    key={currentTagline}
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: "backOut" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Interview
                  </motion.span>
                </motion.h1>

                <motion.p className="hero-subtitle" variants={itemVariants}>
                  Prepare for your dream job with our AI-powered interview platform designed specifically for Amal Jyothi College students. 
                  Get real-time feedback, detailed analytics, and personalized coaching to excel in your campus placements and interviews.
                </motion.p>

                <motion.div className="hero-actions" variants={itemVariants}>
                  <Link to="/login" className="btn-primary-large">
                    <PlayArrow />
                    Start Practicing
                  </Link>
                  <Link to="/about" className="btn-secondary-large">
                    <Analytics />
                    Learn More
                  </Link>
                </motion.div>

                <motion.div className="hero-trust-indicators" variants={itemVariants}>
                  <motion.div 
                    className="trust-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    Trusted by Amal Jyothi College students for campus placement preparation
                  </motion.div>
                  <motion.div 
                    className="trust-logos"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <motion.div 
                      className="trust-logo"
                      whileHover={{ scale: 1.05, y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span 
                        className="trust-icon"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      >
                        🏢
                      </motion.span>
                      Engineering Students
                    </motion.div>
                    <motion.div 
                      className="trust-logo"
                      whileHover={{ scale: 1.05, y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span 
                        className="trust-icon"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        🎓
                      </motion.span>
                      Campus Placements
                    </motion.div>
                    <motion.div 
                      className="trust-logo"
                      whileHover={{ scale: 1.05, y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span 
                        className="trust-icon"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        💼
                      </motion.span>
                      Career Growth
                    </motion.div>
                  </motion.div>
                </motion.div>

              </div>
            </motion.div>

            <motion.div className="hero-right" variants={itemVariants}>
              <div className="hero-image-wrap">
                <motion.img 
                  className="hero-illustration" 
                  src="/p.jpg" 
                  alt="Interview practice"
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, rotate: 1 }}
                />
                <motion.div 
                  className="floating-badge badge-one"
                  variants={badgeVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <CheckCircle style={{ fontSize: '16px', marginRight: '4px' }} />
                  Real-time Analysis
                </motion.div>
                <motion.div 
                  className="floating-badge badge-two"
                  variants={badgeVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 1.4 }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  <Analytics style={{ fontSize: '16px', marginRight: '4px' }} />
                  AI-Powered<br/>
                  <span className="badge-metric">Feedback</span>
                </motion.div>
                <motion.div 
                  className="floating-badge badge-three"
                  variants={badgeVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 1.6 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                >
                  <TrendingUp style={{ fontSize: '16px', marginRight: '4px' }} />
                  Progress Tracking
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Who Benefits Section */}
      <motion.section 
        className="benefits-section snap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-photo" style={{ backgroundImage: "url('/p1.jpg')" }} />
        <div className="benefits-container">
          <h2 className="section-title">Perfect for Amal Jyothi College Students</h2>
          <div className="benefits-grid">
            {[{
              title: 'Final Year Students',
              desc: 'Prepare for campus placements with industry-specific questions and real-time feedback to ace your interviews.'
            },{
              title: 'Pre-Final Year Students',
              desc: 'Start early preparation with our AI platform to build confidence and improve your communication skills.'
            },{
              title: 'Placement Cell',
              desc: 'Support your students with advanced AI-powered interview preparation tools and detailed performance analytics.'
            },{
              title: 'Faculty & Mentors',
              desc: 'Guide students effectively with comprehensive interview preparation resources and progress tracking.'
            },{
              title: 'Alumni Network',
              desc: 'Help current students succeed by sharing industry insights and interview experiences through our platform.'
            },{
              title: 'Career Development',
              desc: 'Enhance your professional skills and prepare for various career opportunities beyond campus placements.'
            }].map((b, i) => (
              <div className="benefit-card" key={i}>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="how-section snap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-photo" style={{ backgroundImage: "url('/p2.jpg')" }} />
        <div className="how-container">
          <h2 className="section-title">How EIRA Helps Amal Jyothi Students</h2>
          <p className="section-subtitle">A simple, effective process designed specifically for engineering students preparing for campus placements.</p>
          <div className="how-grid">
            {[{
              title: 'Choose Your Branch',
              desc: 'Select from Computer Science, Electronics, Mechanical, Civil, and other engineering branches with tailored questions.'
            },{
              title: 'Practice Mock Interviews',
              desc: 'Engage in realistic campus placement interviews with our AI interviewer using advanced speech recognition.'
            },{
              title: 'Get Instant Feedback',
              desc: 'Receive immediate AI-powered analysis of your technical knowledge, communication skills, and interview performance.'
            },{
              title: 'Track Your Progress',
              desc: 'Monitor your improvement with detailed analytics and performance metrics designed for engineering students.'
            },{
              title: 'Focus on Weak Areas',
              desc: 'Get personalized recommendations to improve specific technical and soft skills based on your performance.'
            },{
              title: 'Ace Campus Placements',
              desc: 'Build confidence and excel in your actual campus placement interviews with consistent practice.'
            }].map((s, i) => (
              <div className="how-card" key={i}>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="features-section snap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-photo" style={{ backgroundImage: "url('/p5.jpg')" }} />
        <div className="features-container">
          <motion.div 
            className="features-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title gradient-text">Revolutionary Interview Preparation</h2>
            <p className="section-subtitle">
              Experience the future of interview practice with our cutting-edge AI technology 
              that delivers personalized insights, real-time feedback, and comprehensive performance analysis.
            </p>
          </motion.div>

          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card hover-lift"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="feature-icon"
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="features-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/about" className="btn-primary">
              Discover Our Technology
            </Link>
            <Link to="/contact" className="btn-ghost">
              Contact Sales
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials removed to keep page clean and avoid mock data */}

      {/* Comparison Section */}
      <section className="compare-section snap">
        <div className="section-photo" style={{ backgroundImage: "url('/p4.jpg')" }} />
        <div className="compare-container">
          <h2 className="section-title">Why Amal Jyothi Students Choose EIRA</h2>
          <p className="section-subtitle">Discover how our AI-powered platform gives you the edge in campus placement interviews.</p>
          <div className="compare-table">
            <div className="compare-row compare-head">
              <div>Features</div>
              <div>Traditional Preparation</div>
              <div>EIRA Platform</div>
            </div>
            {[{
              f: 'Practice Availability', a: 'Limited to class schedules', b: 'Practice anytime, anywhere'
            },{
              f: 'Feedback Quality', a: 'Basic or delayed feedback', b: 'Instant, detailed AI analysis'
            },{
              f: 'Branch-Specific Content', a: 'Generic questions', b: 'Tailored for each engineering branch'
            },{
              f: 'Progress Tracking', a: 'Manual or none', b: 'Detailed analytics and improvement metrics'
            },{
              f: 'Campus Placement Focus', a: 'General interview prep', b: 'Specifically designed for campus placements'
            },{
              f: 'Cost for Students', a: 'Expensive coaching', b: 'Free for Amal Jyothi students'
            }].map((r, i) => (
              <div className="compare-row" key={i}>
                <div className="feat">{r.f}</div>
                <div>{r.a}</div>
                <div>{r.b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Footer Section */}
      <motion.section 
        className="footer-section snap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-photo" style={{ backgroundImage: "url('/p5.jpg')" }} />
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-title">Ready to Ace Your Campus Placements?</h3>
              <p className="footer-description">
                Join your fellow Amal Jyothi students who are already using EIRA to prepare for their dream jobs. Start your journey to placement success today.
              </p>
            </div>
            <div className="footer-actions">
              <Link to="/login" className="btn-primary-large">
                <PlayArrow />
                Start Practicing
              </Link>
              <Link to="/contact" className="btn-secondary-large">
                Contact Support
              </Link>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-info">
              <p>&copy; 2024 EIRA. All rights reserved.</p>
              <p>Empowering Amal Jyothi students to excel in campus placements.</p>
            </div>
          </div>
        </div>
      </motion.section>
      </div>

      {/* Fixed CTA - stays on screen while scrolling */}
      <Link to="/login" className="fixed-cta">Start Practicing</Link>
    </>
  )
}

export default Landing
