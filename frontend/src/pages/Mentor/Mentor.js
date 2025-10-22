import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import './Mentor.css';
import NewMessageNotifier from '../../components/Chat/NewMessageNotifier';

const Mentor = () => {
    const { logout, user } = UserAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        document.title = 'Mentor';
        const storedTheme = localStorage.getItem('mentor-theme');
        if (storedTheme === 'dark') setDarkMode(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('mentor-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

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
                        <h1>Mentor</h1>
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
                    <div className="card">
                        <div className="card-content">
                            <h2>Welcome to Mentor Portal</h2>
                            <p>Use the navigation menu to access Chat and Notice features.</p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button className="btn-primary" onClick={() => navigate('/mentor/chat')}>
                                    Go to Chat
                                </button>
                                <button className="btn-primary" onClick={() => navigate('/mentor/notices')}>
                                    View Notices
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Mentor;
