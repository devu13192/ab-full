import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import './Mentor.css';
import NewMessageNotifier from '../../components/Chat/NewMessageNotifier';

const MentorNoticePage = () => {
    const { logout, user } = UserAuth();
    const navigate = useNavigate();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.title = 'Mentor Notices';
        const storedTheme = localStorage.getItem('mentor-theme');
        if (storedTheme === 'dark') setDarkMode(true);
        
        fetchAds();
    }, []);

    useEffect(() => {
        localStorage.setItem('mentor-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const res = await fetch('/ads');
            if (res.ok) {
                const data = await res.json();
                setAds(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to load notices', error);
        } finally {
            setLoading(false);
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

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ad.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterType === 'all' || 
                            (filterType === 'recent' && new Date(ad.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                            (filterType === 'my-ads' && ad.createdBy === user?.email);
        
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className={`mentor-shell ${darkMode ? 'dark' : ''}`}>
                <aside className="mentor-sidebar">
                    <div className="sidebar-header">
                        <span className="brand">Mentor</span>
                    </div>
                    <nav className="sidebar-nav">
                        <button className="nav-item" onClick={() => navigate('/mentor/dashboard')}>
                            <span role="img" aria-label="dashboard">📊</span>
                            <span>Dashboard</span>
                        </button>
                        <button className="nav-item" onClick={() => navigate('/mentor/chat')}>
                            <span role="img" aria-label="chat">💬</span>
                            <span>Chat</span>
                            <span id="mentor-chat-badge" className="badge" style={{ marginLeft: 8, display: 'none' }}>0</span>
                        </button>
                        <button className="nav-item active">
                            <span role="img" aria-label="notice">📢</span>
                            <span>Notice</span>
                        </button>
                    </nav>
                </aside>

                <div className="mentor-main">
                    <header className="mentor-topbar">
                        <div className="topbar-left">
                            <h1>Notices & Announcements</h1>
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
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading notices...</p>
                        </div>
                    </main>
                </div>
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
                    <button className="nav-item" onClick={() => navigate('/mentor/manage-ads')}>
                        <span role="img" aria-label="ads">📢</span>
                        <span>Manage Ads</span>
                    </button>
                    <button className="nav-item active">
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
                        <h1>Notices & Announcements</h1>
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
                    
                    {/* Hero Section */}
                    <section className="welcome-section">
                        <div className="welcome-card">
                            <h2>Welcome to Mentor Dashboard</h2>
                            <p>Stay updated with the latest placement and interview information.</p>
                        </div>
                    </section>

                    {/* Search and Filter Section */}
                    <section className="search-filter-section">
                        <div className="card">
                            <div className="card-content">
                                <div className="search-filter-container">
                                    <div className="search-container">
                                        <div className="search-input-wrapper">
                                            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <path d="m21 21-4.35-4.35"></path>
                                            </svg>
                                            <input
                                                type="text"
                                                placeholder="Search notices..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="search-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="filter-tabs">
                                        <button 
                                            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                                            onClick={() => setFilterType('all')}
                                        >
                                            All ({ads.length})
                                        </button>
                                        <button 
                                            className={`filter-tab ${filterType === 'recent' ? 'active' : ''}`}
                                            onClick={() => setFilterType('recent')}
                                        >
                                            Recent ({ads.filter(ad => new Date(ad.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length})
                                        </button>
                                        <button 
                                            className={`filter-tab ${filterType === 'my-ads' ? 'active' : ''}`}
                                            onClick={() => setFilterType('my-ads')}
                                        >
                                            My Ads ({ads.filter(ad => ad.createdBy === user?.email).length})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notices Grid */}
                    <section className="notices-section">
                        {filteredAds.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No notices yet. Check back soon.</h3>
                                <p>No notices match your current search criteria.</p>
                            </div>
                        ) : (
                            <div className="notices-grid">
                                {filteredAds.map((ad) => (
                                    <div key={ad._id} className="notice-card">
                                        {ad.imageUrl && (
                                            <div className="notice-media">
                                                <img src={ad.imageUrl} alt={ad.title} />
                                                <div className="media-overlay">
                                                    <div className="overlay-badge">Notice</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="notice-content">
                                            <div className="notice-header">
                                                <h3 className="notice-title">{ad.title}</h3>
                                                <div className="notice-meta">
                                                    <span className="meta-time">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polyline points="12,6 12,12 16,14"></polyline>
                                                        </svg>
                                                        {getTimeAgo(ad.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="notice-description">{ad.description}</p>
                                            <div className="notice-footer">
                                                <div className="notice-author">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                    </svg>
                                                    {ad.createdBy || 'Mentor'}
                                                </div>
                                                {ad.link && (
                                                    <a className="notice-link" href={ad.link} target="_blank" rel="noreferrer">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                            <polyline points="15,3 21,3 21,9"></polyline>
                                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                                        </svg>
                                                        View Details
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default MentorNoticePage;

