import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import "./About.css";
import ProfessionalNavbar from "../../components/Navbar/ProfessionalNavbar";
import Footer from '../../components/Footer/Footer';
import { 
  Psychology, 
  AccessTime, 
  Assessment, 
  Security, 
  TrendingUp, 
  DataUsage,
  Lock,
  Rocket,
  Lightbulb,
  Computer,
  Settings,
  Storage,
  PsychologyAlt,
  PlayArrow,
  Info
} from '@mui/icons-material';

const About = () => {
  useEffect(() => {
    document.title = 'About EIRA - AI-Powered Interview Platform';
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

  const missionStats = [
    { icon: <Psychology />, title: "Intelligent", subtitle: "AI-Powered Analysis", color: "var(--primary-500)" },
    { icon: <AccessTime />, title: "Accessible", subtitle: "24/7 Availability", color: "var(--secondary-500)" },
    { icon: <Assessment />, title: "Comprehensive", subtitle: "Full-Spectrum Feedback", color: "var(--accent-500)" }
  ]

  const values = [
    { icon: <TrendingUp />, title: "Excellence", description: "We strive for excellence in every aspect of our platform, from user experience to technical performance and customer support.", color: "var(--success-500)" },
    { icon: <PsychologyAlt />, title: "Innovation", description: "Continuously pushing the boundaries of what's possible with AI and machine learning to deliver cutting-edge solutions.", color: "var(--primary-500)" },
    { icon: <DataUsage />, title: "Data-Driven", description: "Leveraging comprehensive analytics and insights to provide actionable feedback and continuous improvement.", color: "var(--secondary-500)" },
    { icon: <Lock />, title: "Trust", description: "Building trust through robust security measures, transparent practices, and reliable service delivery.", color: "var(--warning-500)" },
    { icon: <Rocket />, title: "Scalability", description: "Designing solutions that grow with our clients' needs while maintaining performance and quality standards.", color: "var(--accent-500)" },
    { icon: <Lightbulb />, title: "User-Centric", description: "Placing user needs at the center of our design decisions to create intuitive and effective solutions.", color: "var(--success-500)" }
  ]

  const expertise = [
    { icon: <Computer />, title: "Frontend Excellence", subtitle: "React.js Development", description: "Modern, responsive user interfaces that provide seamless user experiences across all devices and platforms.", color: "var(--primary-500)" },
    { icon: <Settings />, title: "Backend Architecture", subtitle: "Node.js & Express.js", description: "Robust, scalable server infrastructure designed to handle high-performance requirements and complex integrations.", color: "var(--secondary-500)" },
    { icon: <Storage />, title: "Data Management", subtitle: "MongoDB Solutions", description: "Efficient data architecture that ensures fast access, secure storage, and reliable performance for all user interactions.", color: "var(--accent-500)" },
    { icon: <Psychology />, title: "AI & Machine Learning", subtitle: "Intelligent Systems", description: "Advanced natural language processing and speech recognition that delivers accurate, meaningful insights and feedback without human intervention.", color: "var(--success-500)" }
  ]

  const timeline = [
    { year: "2023", title: "Foundation", description: "Core platform development with authentication and basic interview functionality", status: "completed" },
    { year: "2024", title: "Innovation", description: "Advanced AI integration and comprehensive performance analytics", status: "current" },
    { year: "2025", title: "Expansion", description: "Enterprise solutions and advanced speech analysis capabilities", status: "upcoming" }
  ]

  const techFeatures = [
    { icon: "🔐", title: "Enterprise Security", description: "Google OAuth 2.0 integration with JWT tokens and role-based access control for maximum security" },
    { icon: "🎤", title: "Advanced Speech Processing", description: "State-of-the-art speech recognition technology for seamless interview simulation and response capture" },
    { icon: "🤖", title: "Intelligent Analysis", description: "Sophisticated NLP algorithms that provide comprehensive performance evaluation and personalized insights automatically" },
    { icon: "📊", title: "Comprehensive Analytics", description: "Detailed performance metrics and actionable recommendations generated instantly by our AI systems" }
  ]

  return (
    <>
      <ProfessionalNavbar />
      
      {/* Hero Section */}
      <motion.section 
        className="about-hero"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="about-hero-background">
          <div className="hero-gradient-overlay"></div>
          <div className="hero-particles"></div>
        </div>
        
        <div className="about-hero-content">
          <motion.div className="hero-badge" variants={itemVariants}>
            <motion.span 
              className="hero-badge-text"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
            >
              <motion.span 
                className="badge-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                🚀
              </motion.span>
              About Our Platform
            </motion.span>
          </motion.div>

          <motion.h1 className="about-hero-title" variants={itemVariants}>
            <motion.span 
              className="title-line-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Leading the Future of
            </motion.span>
            <motion.span 
              className="gradient-text title-line-2"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "backOut" }}
            >
              Interview Preparation
            </motion.span>
          </motion.h1>

          <motion.p className="about-hero-subtitle" variants={itemVariants}>
            Discover how EIRA is revolutionizing interview preparation with intelligent AI technology that transforms how candidates prepare for success. Our platform combines cutting-edge artificial intelligence with user-centric design to deliver unparalleled interview practice experiences.
          </motion.p>

          <motion.div className="hero-stats-preview" variants={itemVariants}>
            <motion.div 
              className="stat-preview"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stat-preview-icon">🎯</div>
              <div className="stat-preview-text">
                <div className="stat-preview-number">100%</div>
                <div className="stat-preview-label">AI-Powered</div>
              </div>
            </motion.div>
            <motion.div 
              className="stat-preview"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stat-preview-icon">⚡</div>
              <div className="stat-preview-text">
                <div className="stat-preview-number">24/7</div>
                <div className="stat-preview-label">Available</div>
              </div>
            </motion.div>
            <motion.div 
              className="stat-preview"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stat-preview-icon">🔒</div>
              <div className="stat-preview-text">
                <div className="stat-preview-number">100%</div>
                <div className="stat-preview-label">Secure</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        className="mission-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="mission-container">
          <motion.div 
            className="mission-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="gradient-text">Our Mission</h2>
            <p>
              EIRA is revolutionizing interview preparation by providing a sophisticated, AI-driven platform that delivers personalized practice experiences. We eliminate the traditional barriers of scheduling conflicts and limited availability, offering 24/7 access to comprehensive interview simulation and analysis powered entirely by artificial intelligence.
            </p>
            <div className="mission-stats">
              {missionStats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="stat-item"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <h3>{stat.title}</h3>
                  <p>{stat.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            className="mission-visual"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mission-image-container">
              <motion.img 
                src="/p.jpg" 
                alt="AI Interview Platform"
                className="mission-image"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.02, rotate: 1 }}
              />
              <div className="image-overlay">
                <div className="overlay-content">
                  <motion.div 
                    className="ai-badge"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Psychology className="ai-icon" />
                    <span>AI-Powered</span>
                  </motion.div>
                  <motion.div 
                    className="tech-badge"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Computer className="tech-icon" />
                    <span>Smart Analysis</span>
                  </motion.div>
                  <motion.div 
                    className="security-badge"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Security className="security-icon" />
                    <span>Secure Platform</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Story & Timeline Section */}
      <motion.section 
        className="story-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="story-container">
          <motion.h2 
            className="gradient-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Story
          </motion.h2>
          <div className="story-content">
            <motion.div 
              className="story-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p>EIRA was born from a fundamental insight: the traditional interview preparation model was broken. Students and professionals faced significant challenges accessing quality practice opportunities due to high costs, inconsistent feedback quality, and the inability to practice at their own pace.</p>
              <p>We recognized that AI technology could bridge this gap. By combining advanced artificial intelligence, natural language processing, and speech recognition, we've created a platform that not only simulates realistic interview experiences but provides deeper insights than traditional methods, all without the need for human intervention.</p>
              <div className="availability-notice">
                <Info className="notice-icon" />
                <div className="notice-content">
                  <h4>Current Availability</h4>
                  <p>Our services are currently available exclusively for students of AJCE (Amal Jyothi College of Engineering) as we focus on perfecting our platform and ensuring optimal performance. This controlled rollout allows us to gather valuable feedback and optimize our systems for future scalability.</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="story-timeline"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {timeline.map((item, index) => (
                <motion.div 
                  key={index}
                  className={`timeline-item ${item.status}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="timeline-marker">
                    {item.year}
                  </div>
                  <div className="timeline-content">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section 
        className="values-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="values-container">
          <motion.h2 
            className="gradient-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Values
          </motion.h2>
          <motion.div 
            className="values-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="value-card hover-lift"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
                }}
              >
                <div className="value-icon" style={{ color: value.color }}>
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Expertise Section */}
      <motion.section 
        className="expertise-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="expertise-container">
          <motion.h2 
            className="gradient-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Expertise
          </motion.h2>
          <motion.div 
            className="expertise-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {expertise.map((item, index) => (
              <motion.div 
                key={index}
                className="expertise-card hover-lift"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
                }}
              >
                <div className="expertise-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p className="expertise-subtitle">{item.subtitle}</p>
                <p className="expertise-description">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Technology Section */}
      <motion.section 
        className="technology-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="technology-container">
          <motion.h2 
            className="gradient-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Technology
          </motion.h2>
          <div className="tech-content">
            <motion.div 
              className="tech-description"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p>
                EIRA leverages cutting-edge technology to deliver a platform that's not just powerful, but also intuitive and reliable. Our architecture is designed for performance, security, and scalability, ensuring we can meet the needs of individual users and enterprise clients alike with fully automated AI-powered solutions.
              </p>
              <div className="tech-features">
                {techFeatures.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="tech-feature"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <h4>{feature.icon} {feature.title}</h4>
                    <p>{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              className="tech-visual"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="tech-diagram">
                {[
                  { icon: "🎤", label: "Input Capture" },
                  { icon: "🔄", label: "Processing" },
                  { icon: "📈", label: "Analysis" },
                  { icon: "💡", label: "Insights" }
                ].map((step, index) => (
                  <motion.div 
                    key={index}
                    className="diagram-layer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>{step.icon}</span>
                    <p>{step.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="cta-container">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Experience the Future of Interview Preparation?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Currently available exclusively for AJCE students as we perfect our platform. Join us in this exciting journey as we prepare to scale our revolutionary AI-powered interview preparation technology to a wider audience.
          </motion.p>
          <motion.div 
            className="cta-buttons"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/login" className="btn-primary-large">
              <PlayArrow />
              Start Your Journey
            </Link>
            <Link to="/contact" className="btn-secondary-large">
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      <Footer />
    </>
  );
};

export default About;
