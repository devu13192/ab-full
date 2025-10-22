import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import './Mentor.css';
import NewMessageNotifier from '../../components/Chat/NewMessageNotifier';

const MentorDashboard = () => {
    const { logout, user } = UserAuth();
    const navigate = useNavigate();
    const [mentorData, setMentorData] = useState(null);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.title = 'Mentor Dashboard';
        const storedTheme = localStorage.getItem('mentor-theme');
        if (storedTheme === 'dark') setDarkMode(true);
        
        // Fetch mentor data
        fetchMentorData();
        fetchAds();
    }, []);

    useEffect(() => {
        localStorage.setItem('mentor-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const fetchMentorData = async () => {
        try {
            // For now, we'll use the user's email to identify the mentor
            // In a real implementation, you'd have a separate mentor authentication
            const response = await fetch('/mentor');
            if (response.ok) {
                const mentors = await response.json();
                const currentMentor = mentors.find(mentor => 
                    mentor.email === user?.email || 
                    mentor.credentials?.email === user?.email
                );
                setMentorData(currentMentor);
            }
        } catch (error) {
            console.error('Error fetching mentor data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAds = async () => {
        try {
            const res = await fetch('/ads/all');
            if (res.ok) {
                const list = await res.json();
                setAds(list || []);
            }
        } catch (e) {
            console.error('Failed to load ads', e);
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
                <p>Loading mentor dashboard...</p>
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
                    <button className="nav-item active">
                        <span role="img" aria-label="dashboard">📊</span>
                        <span>Dashboard</span>
                    </button>
                    <button className="nav-item" onClick={() => navigate('/mentor/manage-ads')}>
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
                        <h1>Dashboard</h1>
                        <p>Welcome back, Mentor</p>
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
                    
                    {/* Welcome Section */}
                    <section className="welcome-section">
                        <div className="welcome-card">
                            <div className="welcome-content">
                                <h2>Welcome back, Mentor!</h2>
                                <p>Manage your mentorship activities, track student progress, and create opportunities for career growth.</p>
                                <div className="welcome-actions">
                                    <button className="btn-primary" onClick={() => navigate('/mentor/manage-ads')}>
                                        Create New Ad
                                    </button>
                                    <button className="btn-secondary" onClick={() => navigate('/mentor/chat')}>
                                        View Messages
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Statistics Overview */}
                    <section className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">0</div>
                                <div className="stat-label">Students Assigned</div>
                                <div className="stat-change">+0 this month</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                    <line x1="8" y1="21" x2="16" y2="21"></line>
                                    <line x1="12" y1="17" x2="12" y2="21"></line>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">{ads.filter(ad => ad.active).length}</div>
                                <div className="stat-label">Active Ads</div>
                                <div className="stat-change">{ads.length} total</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">4.8</div>
                                <div className="stat-label">Average Rating</div>
                                <div className="stat-change">Based on 12 reviews</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14,2 14,8 20,8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10,9 9,9 8,9"></polyline>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">24</div>
                                <div className="stat-label">Feedback Given</div>
                                <div className="stat-change">+3 this week</div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="quick-actions-section">
                        <div className="card">
                            <div className="card-header">
                                <h3>Quick Actions</h3>
                                <p>Common tasks and shortcuts</p>
                            </div>
                            <div className="card-content">
                                <div className="quick-actions-grid">
                                    <button className="quick-action-btn" onClick={() => navigate('/mentor/manage-ads')}>
                                        <div className="action-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                                <line x1="12" y1="17" x2="12" y2="21"></line>
                                            </svg>
                                        </div>
                                        <div className="action-content">
                                            <h4>Manage Ads</h4>
                                            <p>Create and manage placement ads</p>
                                        </div>
                                    </button>
                                    <button className="quick-action-btn" onClick={() => navigate('/mentor/chat')}>
                                        <div className="action-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                            </svg>
                                        </div>
                                        <div className="action-content">
                                            <h4>Messages</h4>
                                            <p>Chat with students</p>
                                        </div>
                                    </button>
                                    <button className="quick-action-btn" onClick={() => navigate('/mentor/notices')}>
                                        <div className="action-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14,2 14,8 20,8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                            </svg>
                                        </div>
                                        <div className="action-content">
                                            <h4>Notices</h4>
                                            <p>View announcements</p>
                                        </div>
                                    </button>
                                    <button className="quick-action-btn">
                                        <div className="action-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                            </svg>
                                        </div>
                                        <div className="action-content">
                                            <h4>Reports</h4>
                                            <p>View analytics</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section className="recent-activity">
                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3>Recent Ads</h3>
                                        <p>Your latest placement and interview opportunities</p>
                                    </div>
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => navigate('/mentor/manage-ads')}
                                    >
                                        View All
                                    </button>
                                </div>
                            </div>
                            <div className="card-content">
                                {ads.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                                <line x1="12" y1="17" x2="12" y2="21"></line>
                                            </svg>
                                        </div>
                                        <h4>No ads yet</h4>
                                        <p>Create your first placement or interview ad to get started.</p>
                                        <button className="btn-primary" onClick={() => navigate('/mentor/manage-ads')}>
                                            Create Your First Ad
                                        </button>
                                    </div>
                                ) : (
                                    <div className="recent-ads-list">
                                        {ads.slice(0, 3).map(ad => (
                                            <div key={ad._id} className="recent-ad-item">
                                                <div className="ad-preview">
                                                    {ad.imageUrl ? (
                                                        <img src={ad.imageUrl} alt={ad.title} />
                                                    ) : (
                                                        <div className="ad-placeholder">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                                                <line x1="12" y1="17" x2="12" y2="21"></line>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ad-info">
                                                    <h4>{ad.title}</h4>
                                                    <p>{ad.description.length > 80 ? ad.description.substring(0, 80) + '...' : ad.description}</p>
                                                    <div className="ad-meta">
                                                        <span className={`status-badge ${ad.active ? 'active' : 'inactive'}`}>
                                                            {ad.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span className="ad-date">
                                                            {new Date(ad.createdAt || Date.now()).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ad-actions">
                                                    <button 
                                                        className="btn-secondary"
                                                        onClick={() => navigate('/mentor/manage-ads')}
                                                    >
                                                        Manage
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

export default MentorDashboard;
