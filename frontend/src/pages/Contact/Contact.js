import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import "./Contact.css";
import ProfessionalNavbar from "../../components/Navbar/ProfessionalNavbar";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [submitMessage, setSubmitMessage] = useState('');
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = 'Contact Us - EIRA Interview Platform';
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
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const emailRegex = useMemo(() =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  , []);

  // Enhanced validation functions for each field
  const validateName = (name) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Full name is required';
    }
    
    // Check for alphabets and spaces only
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return 'Name must contain only letters and spaces';
    }
    
    // Check for minimum two words (first and last name)
    const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 2) {
      return 'Please enter your first and last name';
    }
    
    // Check for meaningful names (reject single letters or very short words)
    const hasValidWords = words.every(word => word.length >= 2);
    if (!hasValidWords) {
      return 'Each name part must be at least 2 characters long';
    }
    
    // Enhanced keyboard pattern detection
    const keyboardPatterns = [
      /^[qwertyuiop]+$/i,
      /^[asdfghjkl]+$/i,
      /^[zxcvbnm]+$/i,
      /^[abcdefghijklmnopqrstuvwxyz]+$/i,
      /^(.)\1+$/i, // repeated characters
      /^[lkjhgfdsa]+$/i, // reverse keyboard patterns
      /^[poiuytrewq]+$/i,
      /^[mnbvcxz]+$/i
    ];
    
    if (keyboardPatterns.some(pattern => pattern.test(trimmedName))) {
      return 'Please enter a valid name (no keyboard patterns)';
    }
    
    // Check for all uppercase junk text
    if (trimmedName === trimmedName.toUpperCase() && trimmedName.length > 3) {
      return 'Please use proper case for your name';
    }
    
    // Check for excessive repetition in words
    const hasExcessiveRepetition = words.some(word => {
      const charCounts = {};
      for (let char of word.toLowerCase()) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      const maxCount = Math.max(...Object.values(charCounts));
      return maxCount > word.length * 0.6; // More than 60% same character
    });
    
    if (hasExcessiveRepetition) {
      return 'Name contains too much repetition';
    }
    
    // Check for realistic name patterns (should have vowels)
    const hasVowels = words.some(word => /[aeiou]/i.test(word));
    if (!hasVowels) {
      return 'Please enter a valid name';
    }
    
    // Check total length
    if (trimmedName.length < 3) {
      return 'Name must be at least 3 characters long';
    }
    
    if (trimmedName.length > 50) {
      return 'Name must be less than 50 characters';
    }
    
    return null;
  };

  const validateEmail = (email) => {
    if (!email) {
      return 'Email address is required';
    }
    
    const trimmedEmail = email.trim();
    
    // Basic format validation
    if (!emailRegex.test(trimmedEmail)) {
      return 'Please enter a valid email address (e.g., name@example.com)';
    }
    
    // Check for common invalid patterns
    if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      return 'Email format is invalid';
    }
    
    // Check for suspicious patterns
    if (trimmedEmail.includes('@') && !trimmedEmail.includes('.')) {
      return 'Email must include a valid domain';
    }
    
    // Enhanced spam detection
    const localPart = trimmedEmail.split('@')[0];
    const domainPart = trimmedEmail.split('@')[1];
    
    // Check for excessive repetition in local part
    if (localPart.length > 10) {
      const charCounts = {};
      for (let char of localPart.toLowerCase()) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      const maxCount = Math.max(...Object.values(charCounts));
      if (maxCount > localPart.length * 0.5) {
        return 'Email contains too much repetition';
      }
    }
    
    // Check for numeric repetition (like 454444444444444444444444444444444)
    if (/\d{10,}/.test(localPart)) {
      return 'Email contains excessive numeric repetition';
    }
    
    // Check for keyboard patterns in local part
    const keyboardPatterns = [
      /^[qwertyuiop]+$/i,
      /^[asdfghjkl]+$/i,
      /^[zxcvbnm]+$/i,
      /^[abcdefghijklmnopqrstuvwxyz]+$/i
    ];
    
    if (keyboardPatterns.some(pattern => pattern.test(localPart))) {
      return 'Email appears to contain keyboard patterns';
    }
    
    // Check for valid domain
    if (!domainPart || domainPart.length < 4) {
      return 'Email domain is too short';
    }
    
    // Check for common spam domains
    const spamDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    if (spamDomains.some(domain => domainPart.includes(domain))) {
      return 'Please use a permanent email address';
    }
    
    // Check length
    if (trimmedEmail.length > 254) {
      return 'Email address is too long';
    }
    
    return null;
  };

  const validateMobile = (phone) => {
    if (!phone) {
      return null; // Phone is optional
    }
    
    const cleaned = phone.replace(/\D/g, ''); // Remove all non-digits
    
    if (cleaned.length !== 10) {
      return 'Mobile number must be exactly 10 digits';
    }
    
    // Check if it starts with 6, 7, 8, or 9
    if (!/^[6789]/.test(cleaned)) {
      return 'Mobile number must start with 6, 7, 8, or 9';
    }
    
    // Enhanced spam and fake number detection
    // Check for repeated digits (spam prevention)
    if (/^(\d)\1{9}$/.test(cleaned)) {
      return 'Please enter a valid mobile number';
    }
    
    // Check for sequential patterns
    const isSequential = /^(0123456789|9876543210)$/.test(cleaned);
    if (isSequential) {
      return 'Please enter a valid mobile number';
    }
    
    // Check for excessive repetition (more than 5 same digits)
    const digitCounts = {};
    for (let digit of cleaned) {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(digitCounts));
    if (maxCount > 5) {
      return 'Mobile number contains too much repetition';
    }
    
    // Check for unrealistic patterns (like 9555555555, 8888888888)
    const unrealisticPatterns = [
      /^9{10}$/, // All 9s
      /^8{10}$/, // All 8s
      /^7{10}$/, // All 7s
      /^6{10}$/, // All 6s
      /^(\d)\1{4,}$/ // 5 or more consecutive same digits
    ];
    
    if (unrealisticPatterns.some(pattern => pattern.test(cleaned))) {
      return 'Please enter a valid mobile number';
    }
    
    // Check for common fake patterns
    if (cleaned === '1234567890' || cleaned === '9876543210') {
      return 'Please enter a valid mobile number';
    }
    
    return null;
  };

  const validateMessage = (message) => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      return 'Message is required';
    }
    
    // Check minimum length
    if (trimmedMessage.length < 20) {
      return 'Message must be at least 20 characters long';
    }
    
    // Check maximum length
    if (trimmedMessage.length > 2000) {
      return 'Message must be less than 2000 characters';
    }
    
    // Enhanced meaningful content validation
    const words = trimmedMessage.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 3) {
      return 'Please provide a more detailed message';
    }
    
    // Enhanced keyboard pattern detection
    const keyboardPatterns = [
      /^[qwertyuiop\s]+$/i,
      /^[asdfghjkl\s]+$/i,
      /^[zxcvbnm\s]+$/i,
      /^[abcdefghijklmnopqrstuvwxyz\s]+$/i,
      /^(.)\1+$/i, // repeated characters
      /^[lkjhgfdsa\s]+$/i, // reverse keyboard patterns
      /^[poiuytrewq\s]+$/i,
      /^[mnbvcxz\s]+$/i,
      /^[gfdfghjkl';lkjhglokiju\s]+$/i // specific gibberish pattern
    ];
    
    if (keyboardPatterns.some(pattern => pattern.test(trimmedMessage))) {
      return 'Please provide a meaningful message (no keyboard patterns)';
    }
    
    // Check for proper sentence structure (should contain some punctuation or proper words)
    const hasProperWords = words.some(word => word.length >= 3);
    if (!hasProperWords) {
      return 'Message should contain meaningful words';
    }
    
    // Enhanced repetition detection
    const wordCounts = {};
    words.forEach(word => {
      wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
    });
    
    const maxRepeats = Math.max(...Object.values(wordCounts));
    if (maxRepeats > words.length * 0.3) {
      return 'Message contains too much repetition';
    }
    
    // Check for character repetition within words
    const hasExcessiveCharRepetition = words.some(word => {
      if (word.length < 4) return false;
      const charCounts = {};
      for (let char of word.toLowerCase()) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      const maxCount = Math.max(...Object.values(charCounts));
      return maxCount > word.length * 0.5; // More than 50% same character
    });
    
    if (hasExcessiveCharRepetition) {
      return 'Message contains excessive character repetition';
    }
    
    // Check for realistic sentence structure
    const hasVowels = words.some(word => /[aeiou]/i.test(word));
    if (!hasVowels) {
      return 'Message should contain proper words';
    }
    
    // Check for minimum meaningful content
    const meaningfulWords = words.filter(word => 
      word.length >= 3 && 
      /[aeiou]/i.test(word) && 
      !/^(.)\1+$/.test(word)
    );
    
    if (meaningfulWords.length < 2) {
      return 'Please provide a more detailed and meaningful message';
    }
    
    // Check for common spam patterns
    const spamPatterns = [
      /(.)\1{4,}/, // 5 or more consecutive same characters
      /[^a-zA-Z0-9\s.,!?]{3,}/, // 3 or more consecutive special characters
      /\b(.)\1{3,}\b/ // 4 or more consecutive same characters in a word
    ];
    
    if (spamPatterns.some(pattern => pattern.test(trimmedMessage))) {
      return 'Message contains suspicious patterns';
    }
    
    return null;
  };

  const validate = (data) => {
    const nextErrors = {};
    
    // Validate each field
    const nameError = validateName(data.name);
    if (nameError) nextErrors.name = nameError;
    
    const emailError = validateEmail(data.email);
    if (emailError) nextErrors.email = emailError;
    
    const mobileError = validateMobile(data.phone);
    if (mobileError) nextErrors.phone = mobileError;
    
    if (!data.inquiryType) {
      nextErrors.inquiryType = 'Please select an inquiry type';
    }
    
    const messageError = validateMessage(data.message);
    if (messageError) nextErrors.message = messageError;
    
    if (!data.consent) {
      nextErrors.consent = 'You must agree to be contacted regarding your inquiry';
    }
    
    return nextErrors;
  };

  useEffect(() => {
    setErrors(validate(formData));
  }, [formData]);

  const formIsValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Apply input restrictions based on field type
    if (name === 'name') {
      // Only allow letters and spaces for name
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phone') {
      // Only allow digits for phone number
      processedValue = value.replace(/\D/g, '');
      // Limit to 10 digits
      if (processedValue.length > 10) {
        processedValue = processedValue.substring(0, 10);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, inquiryType: true, message: true, consent: true });
    const currentErrors = validate(formData);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) {
      return;
    }
    console.log('Form submitted with data:', formData);
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');
    
    try {
      console.log('Sending request to:', 'http://localhost:5000/api/contacts');
      const response = await axios.post('http://localhost:5000/api/contacts', formData);
      
      if (response.data.success) {
        setSubmitStatus('success');
        setSubmitMessage(response.data.message || 'Your message has been sent successfully!');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: '',
          message: '',
          consent: false
        });
        setTouched({});
      } else {
        setSubmitStatus('error');
        setSubmitMessage(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
      setSubmitStatus('error');
      setSubmitMessage(
        error.response?.data?.message || 
        'Failed to send message. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ProfessionalNavbar />
      <motion.section 
        className="contact-hero"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="contact-hero-content">
          <motion.h1 className="gradient-text" variants={itemVariants}>Get in Touch</motion.h1>
          <motion.p variants={itemVariants}>Ready to transform your interview preparation experience? Our team is here to help you get started with EIRA's advanced AI-powered platform.</motion.p>
        </div>
      </motion.section>

      <section className="contact-main">
        <div className="contact-container">
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            <div className="availability-notice">
              <div className="notice-icon">ℹ️</div>
              <div className="notice-content">
                <h4>Current Availability</h4>
                <p>Our services are currently available exclusively for students of AJCE (Amal Jyothi College of Engineering) as we focus on perfecting our platform and ensuring optimal performance. This controlled rollout allows us to gather valuable feedback and optimize our systems for future scalability.</p>
              </div>
            </div>
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <h4>General Inquiries</h4>
                  <p><a href="mailto:info@eira.app">info@eira.app</a></p>
                  <span className="response-time">Response within 24 hours</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🕒</div>
                <div className="contact-details">
                  <h4>Business Hours</h4>
                  <p>Monday - Friday</p>
                  <span className="response-time">9:00 AM - 6:00 PM UTC</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">💼</div>
                <div className="contact-details">
                  <h4>Enterprise Solutions</h4>
                  <p><a href="mailto:enterprise@eira.app">enterprise@eira.app</a></p>
                  <span className="response-time">Custom implementations and partnerships</span>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🔧</div>
                <div className="contact-details">
                  <h4>Technical Support</h4>
                  <p><a href="mailto:support@eira.app">support@eira.app</a></p>
                  <span className="response-time">Platform assistance and troubleshooting</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            
            {submitStatus && (
              <div className={`submit-message ${submitStatus}`} role="alert">
                {submitMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                    required
                    className={`${touched.name ? (errors.name ? 'error' : 'success') : ''}`}
                    aria-invalid={Boolean(touched.name && errors.name)}
                    aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
                  />
                  {touched.name && errors.name && (
                    <p id="name-error" className="field-error">{errors.name}</p>
                  )}
                  {touched.name && !errors.name && formData.name && (
                    <p className="field-success">Name looks good!</p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email address"
                    required
                    className={`${touched.email ? (errors.email ? 'error' : 'success') : ''}`}
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                  />
                  {touched.email && errors.email && (
                    <p id="email-error" className="field-error">{errors.email}</p>
                  )}
                  {touched.email && !errors.email && formData.email && (
                    <p className="field-success">Email format is valid!</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your 10-digit mobile number"
                  maxLength="10"
                  className={`${touched.phone ? (errors.phone ? 'error' : 'success') : ''}`}
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                  aria-describedby={touched.phone && errors.phone ? 'phone-error' : undefined}
                />
                {touched.phone && errors.phone && (
                  <p id="phone-error" className="field-error">{errors.phone}</p>
                )}
                {touched.phone && !errors.phone && formData.phone && (
                  <p className="field-success">Mobile number is valid!</p>
                )}
                {formData.phone && (
                  <div className="character-count">
                    {formData.phone.length}/10 digits
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="inquiryType">Inquiry Type *</label>
                <select
                  id="inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className={`${touched.inquiryType ? (errors.inquiryType ? 'error' : 'success') : ''}`}
                  aria-invalid={Boolean(touched.inquiryType && errors.inquiryType)}
                  aria-describedby={touched.inquiryType && errors.inquiryType ? 'inquiryType-error' : undefined}
                >
                  <option value="">Select inquiry type</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="enterprise">Enterprise Solutions</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="other">Other</option>
                </select>
                {touched.inquiryType && errors.inquiryType && (
                  <p id="inquiryType-error" className="field-error">{errors.inquiryType}</p>
                )}
                {touched.inquiryType && !errors.inquiryType && formData.inquiryType && (
                  <p className="field-success">Inquiry type selected!</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  rows="6"
                  placeholder="Tell us about your needs and how we can help you achieve your interview preparation goals..."
                  required
                  maxLength="2000"
                  className={`${touched.message ? (errors.message ? 'error' : 'success') : ''}`}
                  aria-invalid={Boolean(touched.message && errors.message)}
                  aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
                ></textarea>
                {touched.message && errors.message && (
                  <p id="message-error" className="field-error">{errors.message}</p>
                )}
                {touched.message && !errors.message && formData.message && (
                  <p className="field-success">Message looks good!</p>
                )}
                <div className={`character-count ${formData.message.length > 1800 ? 'warning' : formData.message.length > 1950 ? 'error' : ''}`}>
                  {formData.message.length}/2000 characters
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                  />
                  <span className="checkmark"></span>
                  I agree to be contacted regarding my inquiry and consent to the processing of my personal data for business purposes.
                </label>
                {touched.consent && errors.consent && (
                  <p className="field-error">{errors.consent}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting || !formIsValid}
                aria-disabled={isSubmitting || !formIsValid}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How does EIRA's AI technology work?</h4>
              <p>Our platform combines advanced speech recognition, natural language processing, and machine learning to analyze interview responses and provide comprehensive feedback on performance, communication skills, and technical knowledge automatically.</p>
            </div>
            <div className="faq-item">
              <h4>What makes EIRA different from traditional interview prep?</h4>
              <p>Unlike traditional methods that require scheduling and human interaction, EIRA provides 24/7 access to realistic interview simulations with instant, AI-powered feedback that's more consistent and comprehensive than human evaluation.</p>
            </div>
            <div className="faq-item">
              <h4>Why is EIRA currently limited to AJCE students?</h4>
              <p>We're currently in a controlled rollout phase, focusing on perfecting our platform with AJCE students. This allows us to gather valuable feedback, optimize performance, and ensure scalability before expanding to a wider audience.</p>
            </div>
            <div className="faq-item">
              <h4>When will EIRA be available to other institutions?</h4>
              <p>We're actively working on scaling our infrastructure and expanding our services. We plan to gradually roll out to other institutions and organizations as we ensure optimal performance and user experience.</p>
            </div>
            <div className="faq-item">
              <h4>Can EIRA be customized for our organization?</h4>
              <p>Absolutely! We offer enterprise solutions with custom question banks, branded interfaces, and integration capabilities to meet your specific organizational needs and training objectives.</p>
            </div>
            <div className="faq-item">
              <h4>What kind of support do you provide?</h4>
              <p>We offer comprehensive support including technical assistance, onboarding guidance, training sessions, and dedicated account management for enterprise clients to ensure successful platform adoption.</p>
            </div>
            <div className="faq-item">
              <h4>How secure is the platform?</h4>
              <p>EIRA implements enterprise-grade security measures including encrypted data transmission, secure authentication, and strict privacy policies to protect all user information and interview data.</p>
            </div>
            <div className="faq-item">
              <h4>What industries does EIRA support?</h4>
              <p>Our platform is designed to support interview preparation across various industries including technology, finance, healthcare, consulting, and more, with customizable question sets for different roles and sectors.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
