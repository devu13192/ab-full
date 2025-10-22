import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import './Mentor.css';
import NewMessageNotifier from '../../components/Chat/NewMessageNotifier';

const ManageAds = () => {
    const { logout, user } = UserAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [adForm, setAdForm] = useState({ 
        title: '', 
        description: '', 
        link: '', 
        imageUrl: '' 
    });
    const [adImageFile, setAdImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        title: '',
        description: '',
        link: '',
        imageUrl: ''
    });

    useEffect(() => {
        document.title = 'Manage Ads - Mentor';
        const storedTheme = localStorage.getItem('mentor-theme');
        if (storedTheme === 'dark') setDarkMode(true);
        
        fetchAds();
    }, []);

    useEffect(() => {
        localStorage.setItem('mentor-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const fetchAds = async () => {
        try {
            const res = await fetch('/ads/all');
            if (res.ok) {
                const list = await res.json();
                setAds(list || []);
            }
        } catch (e) {
            console.error('Failed to load ads', e);
            showToast('Failed to load ads', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Validation functions
    const validateTitle = (title) => {
        if (!title || title.trim().length === 0) {
            return "Title is required";
        }

        const trimmedTitle = title.trim();
        
        // Check minimum length (at least 3 alphabetic characters)
        const alphabeticChars = trimmedTitle.match(/[a-zA-Z]/g);
        if (!alphabeticChars || alphabeticChars.length < 3) {
            return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
        }

        // Check for digits
        if (/\d/.test(trimmedTitle)) {
            return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
        }

        // Check for special characters (only allow letters and spaces)
        if (!/^[a-zA-Z\s]+$/.test(trimmedTitle)) {
            return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
        }

        // Check for excessive spaces (max 2 spaces, not consecutive)
        const spaceCount = (trimmedTitle.match(/\s/g) || []).length;
        if (spaceCount > 2) {
            return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
        }

        // Check for consecutive spaces
        if (/\s{2,}/.test(trimmedTitle)) {
            return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
        }

        // Check for keyboard patterns and meaningless sequences
        const keyboardPatterns = [
            'asdfghjkjhgfdfghjk', 'qwerty', 'zxcvbn', 'asdfgh', 'qwertyuiop',
            'asdfghjkl', 'zxcvbnm', 'qwertyui', 'asdfghj', 'zxcvbn',
            'qwertyuiopasdfghjklzxcvbnm', 'asdfghjklqwertyuiopzxcvbnm'
        ];
        
        const lowerTitle = trimmedTitle.toLowerCase();
        for (const pattern of keyboardPatterns) {
            if (lowerTitle.includes(pattern.toLowerCase())) {
                return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
            }
        }

        // Check for repetitive patterns (like "aaaa", "bbbb", etc.)
        if (/(.)\1{3,}/.test(trimmedTitle)) {
            return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
        }

        // Check for random character sequences (no more than 3 consecutive consonants or vowels)
        const consonantPattern = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{4,}/;
        const vowelPattern = /[aeiouAEIOU]{4,}/;
        
        if (consonantPattern.test(trimmedTitle) || vowelPattern.test(trimmedTitle)) {
            return "Enter a valid title (only alphabets and max two spaces, no digits or random patterns).";
        }

        return ""; // Valid
    };

    const validateDescription = (description) => {
        if (!description || description.trim().length === 0) {
            return "Description is required";
        }

        const trimmedDesc = description.trim();
        
        // Check minimum length (at least 15 meaningful characters)
        if (trimmedDesc.length < 15) {
            return "Please enter a meaningful description (avoid random or repetitive letters/numbers).";
        }

        // Check for meaningless or repetitive patterns
        const meaninglessPatterns = [
            'wertyuioiuytredfghj', 'dfghjkl', 'eeeeee', 'uuu', '333333333', '888',
            'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'qwertyuiopasdfghjkl',
            'asdfghjklqwertyuiop', 'zxcvbnmqwertyuiop'
        ];
        
        const lowerDesc = trimmedDesc.toLowerCase();
        for (const pattern of meaninglessPatterns) {
            if (lowerDesc.includes(pattern.toLowerCase())) {
                return "Please enter a meaningful description (avoid random or repetitive letters/numbers).";
            }
        }

        // Check for excessive repetitive characters (more than 4 consecutive same characters)
        if (/(.)\1{4,}/.test(trimmedDesc)) {
            return "Please enter a meaningful description (avoid random or repetitive letters/numbers).";
        }

        // Check for excessive repetitive numbers (more than 3 consecutive same digits)
        if (/\d{4,}/.test(trimmedDesc)) {
            return "Please enter a meaningful description (avoid random or repetitive letters/numbers).";
        }

        // Check for keyboard sequences in description
        const keyboardSequences = [
            'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
            'qwertyuiopasdfghjklzxcvbnm'
        ];
        
        for (const sequence of keyboardSequences) {
            if (lowerDesc.includes(sequence.toLowerCase())) {
                return "Please enter a meaningful description (avoid random or repetitive letters/numbers).";
            }
        }

        // Check for excessive consonant or vowel sequences
        const consonantPattern = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/;
        const vowelPattern = /[aeiouAEIOU]{5,}/;
        
        if (consonantPattern.test(trimmedDesc) || vowelPattern.test(trimmedDesc)) {
            return "Please enter a meaningful description (avoid random or repetitive letters/numbers).";
        }

        // Check if description contains at least one meaningful word (basic check)
        const words = trimmedDesc.split(/\s+/);
        const meaningfulWords = words.filter(word => 
            word.length >= 3 && 
            /[a-zA-Z]/.test(word) && 
            !/(.)\1{2,}/.test(word) && // not repetitive
            !/^[0-9]+$/.test(word) // not just numbers
        );
        
        if (meaningfulWords.length === 0) {
            return "Please enter a meaningful description (avoid random or repetitive letters/numbers).";
        }

        return ""; // Valid
    };

    const validateLink = (link) => {
        // If link is empty, it's valid (optional field)
        if (!link || link.trim().length === 0) {
            return "";
        }

        const trimmedLink = link.trim();
        
        // Check for random words/letters patterns (but exclude valid hostnames)
        const randomPatterns = [
            'asdfgh', 'qwerty', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
            'qwertyuiopasdfghjklzxcvbnm', 'asdfghjklqwertyuiop', 'zxcvbnmqwertyuiop',
            'wertyuioiuytredfghj', 'dfghjkl', 'eeeeee', 'uuu', '333333333', '888'
        ];
        
        // Valid hostnames that should not be flagged as random patterns
        const validHostnames = [
            'localhost', 'example', 'test', 'demo', 'app', 'api', 'www', 'admin',
            'mail', 'ftp', 'blog', 'shop', 'store', 'news', 'help', 'support'
        ];
        
        const lowerLink = trimmedLink.toLowerCase();
        
        // First check if the link contains any valid hostname
        const containsValidHostname = validHostnames.some(hostname => 
            lowerLink.includes(hostname)
        );
        
        // Only check for random patterns if no valid hostname is found
        if (!containsValidHostname) {
            for (const pattern of randomPatterns) {
                if (lowerLink.includes(pattern.toLowerCase())) {
                    return "Please enter a valid URL (avoid random letters/words).";
                }
            }
        }

        // Check for repetitive patterns (but be more lenient for valid URLs)
        // Only flag if there are 6+ consecutive same characters (allowing for some valid cases)
        if (/(.)\1{5,}/.test(trimmedLink)) {
            return "Please enter a valid URL (avoid random letters/words).";
        }

        // Check for excessive repetitive numbers (but allow port numbers)
        // Only flag if there are 5+ consecutive same digits
        if (/\d{5,}/.test(trimmedLink)) {
            return "Please enter a valid URL (avoid random letters/words).";
        }

        // Check for excessive consonant or vowel sequences (but be more lenient)
        const consonantPattern = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/;
        const vowelPattern = /[aeiouAEIOU]{6,}/;
        
        if (consonantPattern.test(trimmedLink) || vowelPattern.test(trimmedLink)) {
            return "Please enter a valid URL (avoid random letters/words).";
        }

        // Basic URL validation
        try {
            const url = new URL(trimmedLink);
            
            // Check if it has a valid protocol
            if (!['http:', 'https:'].includes(url.protocol)) {
                return "Please enter a valid URL (must start with http:// or https://).";
            }
            
            // Check if it has a valid hostname
            if (!url.hostname || url.hostname.length < 1) {
                return "Please enter a valid URL (invalid hostname).";
            }
            
            // Allow localhost and local development URLs
            const isLocalhost = url.hostname === 'localhost' || 
                               url.hostname.startsWith('127.') || 
                               url.hostname.startsWith('192.168.') ||
                               url.hostname.startsWith('10.') ||
                               url.hostname.startsWith('172.');
            
            // Allow IP addresses (IPv4 and IPv6)
            const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) || // IPv4
                               /^\[([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\]$/.test(url.hostname); // IPv6
            
            // If it's not localhost/IP, check for valid domain structure
            if (!isLocalhost && !isIPAddress) {
                // Check for valid domain structure (at least one dot)
                if (!url.hostname.includes('.')) {
                    return "Please enter a valid URL (invalid domain format).";
                }
                
                // Check for valid TLD (at least 2 characters after last dot)
                const parts = url.hostname.split('.');
                if (parts.length < 2 || parts[parts.length - 1].length < 2) {
                    return "Please enter a valid URL (invalid domain format).";
                }
            }
            
        } catch (error) {
            return "Please enter a valid URL format (e.g., https://example.com or http://localhost:3000).";
        }

        return ""; // Valid
    };

    const validateImageUrl = (imageUrl) => {
        // If imageUrl is empty, it's valid (optional field)
        if (!imageUrl || imageUrl.trim().length === 0) {
            return "";
        }

        const trimmedImageUrl = imageUrl.trim();
        
        // Check for random words/letters patterns (but exclude valid hostnames)
        const randomPatterns = [
            'asdfgh', 'qwerty', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
            'qwertyuiopasdfghjklzxcvbnm', 'asdfghjklqwertyuiop', 'zxcvbnmqwertyuiop',
            'wertyuioiuytredfghj', 'dfghjkl', 'eeeeee', 'uuu', '333333333', '888'
        ];
        
        // Valid hostnames that should not be flagged as random patterns
        const validHostnames = [
            'localhost', 'example', 'test', 'demo', 'app', 'api', 'www', 'admin',
            'mail', 'ftp', 'blog', 'shop', 'store', 'news', 'help', 'support',
            'imgur', 'imgbb', 'postimg', 'tinypic', 'photobucket', 'flickr',
            'unsplash', 'pixabay', 'pexels', 'imageshack', 'dropbox', 'drive'
        ];
        
        const lowerImageUrl = trimmedImageUrl.toLowerCase();
        
        // First check if the URL contains any valid hostname
        const containsValidHostname = validHostnames.some(hostname => 
            lowerImageUrl.includes(hostname)
        );
        
        // Only check for random patterns if no valid hostname is found
        if (!containsValidHostname) {
            for (const pattern of randomPatterns) {
                if (lowerImageUrl.includes(pattern.toLowerCase())) {
                    return "Please enter a valid image URL (avoid random letters/words).";
                }
            }
        }

        // Check for repetitive patterns (but be more lenient for valid URLs)
        if (/(.)\1{5,}/.test(trimmedImageUrl)) {
            return "Please enter a valid image URL (avoid random letters/words).";
        }

        // Check for excessive repetitive numbers
        if (/\d{5,}/.test(trimmedImageUrl)) {
            return "Please enter a valid image URL (avoid random letters/words).";
        }

        // Check for excessive consonant or vowel sequences
        const consonantPattern = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/;
        const vowelPattern = /[aeiouAEIOU]{6,}/;
        
        if (consonantPattern.test(trimmedImageUrl) || vowelPattern.test(trimmedImageUrl)) {
            return "Please enter a valid image URL (avoid random letters/words).";
        }

        // Basic URL validation
        try {
            const url = new URL(trimmedImageUrl);
            
            // Check if it has a valid protocol
            if (!['http:', 'https:'].includes(url.protocol)) {
                return "Please enter a valid image URL (must start with http:// or https://).";
            }
            
            // Check if it has a valid hostname
            if (!url.hostname || url.hostname.length < 1) {
                return "Please enter a valid image URL (invalid hostname).";
            }
            
            // Allow localhost and local development URLs
            const isLocalhost = url.hostname === 'localhost' || 
                               url.hostname.startsWith('127.') || 
                               url.hostname.startsWith('192.168.') ||
                               url.hostname.startsWith('10.') ||
                               url.hostname.startsWith('172.');
            
            // Allow IP addresses (IPv4 and IPv6)
            const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) || // IPv4
                               /^\[([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\]$/.test(url.hostname); // IPv6
            
            // If it's not localhost/IP, check for valid domain structure
            if (!isLocalhost && !isIPAddress) {
                // Check for valid domain structure (at least one dot)
                if (!url.hostname.includes('.')) {
                    return "Please enter a valid image URL (invalid domain format).";
                }
                
                // Check for valid TLD (at least 2 characters after last dot)
                const parts = url.hostname.split('.');
                if (parts.length < 2 || parts[parts.length - 1].length < 2) {
                    return "Please enter a valid image URL (invalid domain format).";
                }
            }
            
            // Check for valid image file extensions
            const validImageExtensions = [
                '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.tif',
                '.ico', '.avif', '.heic', '.heif'
            ];
            
            const lowerPath = url.pathname.toLowerCase();
            const hasValidExtension = validImageExtensions.some(ext => 
                lowerPath.endsWith(ext)
            );
            
            if (!hasValidExtension) {
                return "Please enter a valid image URL (must end with .jpg, .jpeg, .png, .gif, .webp, .svg, etc.).";
            }
            
        } catch (error) {
            return "Please enter a valid image URL format (e.g., https://example.com/image.jpg).";
        }

        return ""; // Valid
    };

    const handleAdInput = (e) => {
        const { name, value } = e.target;
        setAdForm(prev => ({ ...prev, [name]: value }));
        
        // Real-time validation
        if (name === 'title') {
            const error = validateTitle(value);
            setValidationErrors(prev => ({ ...prev, title: error }));
        } else if (name === 'description') {
            const error = validateDescription(value);
            setValidationErrors(prev => ({ ...prev, description: error }));
        } else if (name === 'link') {
            const error = validateLink(value);
            setValidationErrors(prev => ({ ...prev, link: error }));
        } else if (name === 'imageUrl') {
            const error = validateImageUrl(value);
            setValidationErrors(prev => ({ ...prev, imageUrl: error }));
        }
    };

    const uploadImageIfNeeded = async () => {
        if (!adImageFile) return adForm.imageUrl;
        const form = new FormData();
        form.append('file', adImageFile);
        const res = await fetch('/ads/upload', { method: 'POST', body: form });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields before submission
        const titleError = validateTitle(adForm.title);
        const descriptionError = validateDescription(adForm.description);
        const linkError = validateLink(adForm.link);
        const imageUrlError = validateImageUrl(adForm.imageUrl);
        
        setValidationErrors({
            title: titleError,
            description: descriptionError,
            link: linkError,
            imageUrl: imageUrlError
        });
        
        if (titleError || descriptionError || linkError || imageUrlError) {
            showToast('Please fix the validation errors before submitting', 'error');
            return;
        }
        
        if (!adForm.title.trim() || !adForm.description.trim()) {
            showToast('Title and description are required', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const finalImageUrl = await uploadImageIfNeeded();
            const adData = { 
                ...adForm, 
                imageUrl: finalImageUrl || '', 
                createdBy: user?.email || '',
                active: true
            };

            const url = editingAd ? `/ads/${editingAd._id}` : '/ads';
            const method = editingAd ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(adData)
            });

            if (res.ok) {
                const doc = await res.json();
                if (editingAd) {
                    setAds(prev => prev.map(a => a._id === editingAd._id ? doc : a));
                    showToast('Ad updated successfully', 'success');
                } else {
                    setAds(prev => [doc, ...prev]);
                    showToast('Ad created successfully', 'success');
                }
                resetForm();
            } else {
                showToast('Failed to save ad', 'error');
            }
        } catch (e) {
            console.error('Save ad failed', e);
            showToast('Failed to save ad', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setAdForm({ title: '', description: '', link: '', imageUrl: '' });
        setAdImageFile(null);
        setEditingAd(null);
        setShowModal(false);
        setValidationErrors({ title: '', description: '', link: '', imageUrl: '' });
    };

    const handleEdit = (ad) => {
        setEditingAd(ad);
        setAdForm({
            title: ad.title,
            description: ad.description,
            link: ad.link || '',
            imageUrl: ad.imageUrl || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ad?')) return;
        
        try {
            const res = await fetch(`/ads/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAds(prev => prev.filter(a => a._id !== id));
                showToast('Ad deleted successfully', 'success');
            } else {
                showToast('Failed to delete ad', 'error');
            }
        } catch (e) {
            console.error('Delete ad failed', e);
            showToast('Failed to delete ad', 'error');
        }
    };

    const toggleAdStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`/ads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentStatus })
            });
            if (res.ok) {
                const doc = await res.json();
                setAds(prev => prev.map(a => a._id === id ? doc : a));
                showToast(`Ad ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
            } else {
                showToast('Failed to update ad status', 'error');
            }
        } catch (e) {
            console.error('Update ad status failed', e);
            showToast('Failed to update ad status', 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    if (loading) {
        return (
            <div className="mentor-loading">
                <div className="spinner"></div>
                <p>Loading ads...</p>
            </div>
        );
    }

    return (
        <div className={`mentor-shell ${darkMode ? 'dark' : ''}`}>
            <button 
                className="sidebar-toggle" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
            >
                ☰
            </button>
            <div 
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            <aside className={`mentor-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span className="brand">Mentor Panel</span>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item" onClick={() => navigate('/mentor/dashboard')}>
                        <span role="img" aria-label="dashboard">📊</span>
                        <span>Dashboard</span>
                    </button>
                    <button className="nav-item active">
                        <span role="img" aria-label="ads">📢</span>
                        <span>Manage Ads</span>
                    </button>
                    <button className="nav-item" onClick={() => navigate('/mentor/notices')}>
                        <span role="img" aria-label="notice">📋</span>
                        <span>Notices</span>
                    </button>
                    <button className="nav-item" onClick={() => navigate('/mentor/chat')}>
                        <span role="img" aria-label="chat">💬</span>
                        <span>Chat</span>
                        <span id="mentor-chat-badge" className="badge" style={{ marginLeft: 8, display: 'none' }}>0</span>
                    </button>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <span role="img" aria-label="logout">🚪</span>
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            <div className="mentor-main">
                <header className="mentor-topbar">
                    <div className="topbar-left">
                        <h1>Manage Ads</h1>
                    </div>
                    <div className="topbar-right">
                        <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <div className="profile">
                            <div className="profile-btn">
                                <span role="img" aria-label="user">👤</span>
                                <span className="email">Mentor</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="mentor-content">
                    <NewMessageNotifier />
                    
                    {/* Toast Notification */}
                    {toast.show && (
                        <div className={`toast toast-${toast.type}`}>
                            {toast.message}
                        </div>
                    )}

                    {/* Add New Ad Section */}
                    <section className="add-ad-section">
                        <div className="card">
                            <div className="card-header">
                                <h2>Create New Ad</h2>
                                <p>Add a new placement or interview advertisement</p>
                            </div>
                            <div className="card-content">
                                <form onSubmit={handleSubmit} className="ad-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="title">Title *</label>
                                            <input
                                                id="title"
                                                name="title"
                                                type="text"
                                                value={adForm.title}
                                                onChange={handleAdInput}
                                                placeholder="Enter ad title"
                                                className={validationErrors.title ? 'error' : ''}
                                                required
                                            />
                                            {validationErrors.title && (
                                                <div className="error-message">
                                                    {validationErrors.title}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="description">Description *</label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={adForm.description}
                                                onChange={handleAdInput}
                                                placeholder="Describe your placement or interview opportunity"
                                                rows="4"
                                                className={validationErrors.description ? 'error' : ''}
                                                required
                                            />
                                            {validationErrors.description && (
                                                <div className="error-message">
                                                    {validationErrors.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="link">Optional Link</label>
                                            <input
                                                id="link"
                                                name="link"
                                                type="url"
                                                value={adForm.link}
                                                onChange={handleAdInput}
                                                placeholder="https://example.com"
                                                className={validationErrors.link ? 'error' : ''}
                                            />
                                            {validationErrors.link && (
                                                <div className="error-message">
                                                    {validationErrors.link}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="image">Image Upload</label>
                                            <input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setAdImageFile(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="imageUrl">Or Image URL</label>
                                            <input
                                                id="imageUrl"
                                                name="imageUrl"
                                                type="url"
                                                value={adForm.imageUrl}
                                                onChange={handleAdInput}
                                                placeholder="https://example.com/image.jpg"
                                                className={validationErrors.imageUrl ? 'error' : ''}
                                            />
                                            {validationErrors.imageUrl && (
                                                <div className="error-message">
                                                    {validationErrors.imageUrl}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button type="submit" className="btn-primary" disabled={submitting}>
                                            {submitting ? 'Publishing...' : 'Publish Ad'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>

                    {/* Ads List Section */}
                    <section className="ads-list-section">
                        <div className="card">
                            <div className="card-header">
                                <h2>Your Ads ({ads.length})</h2>
                                <p>Manage your existing advertisements</p>
                            </div>
                            <div className="card-content">
                                {ads.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📢</div>
                                        <h3>No ads yet</h3>
                                        <p>Create your first ad using the form above to get started.</p>
                                    </div>
                                ) : (
                                    <div className="ads-grid">
                                        {ads.map(ad => (
                                            <div key={ad._id} className={`ad-card ${!ad.active ? 'inactive' : ''}`}>
                                                {ad.imageUrl && (
                                                    <div className="ad-image">
                                                        <img src={ad.imageUrl} alt={ad.title} />
                                                    </div>
                                                )}
                                                <div className="ad-content">
                                                    <div className="ad-header">
                                                        <h3>{ad.title}</h3>
                                                        <div className="ad-status">
                                                            <span className={`status-badge ${ad.active ? 'active' : 'inactive'}`}>
                                                                {ad.active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="ad-description">{ad.description}</p>
                                                    {ad.link && (
                                                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="ad-link">
                                                            View Link →
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="ad-actions">
                                                    <button 
                                                        className="btn-secondary"
                                                        onClick={() => toggleAdStatus(ad._id, ad.active)}
                                                    >
                                                        {ad.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button 
                                                        className="btn-secondary"
                                                        onClick={() => handleEdit(ad)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn-danger"
                                                        onClick={() => handleDelete(ad._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ManageAds;
