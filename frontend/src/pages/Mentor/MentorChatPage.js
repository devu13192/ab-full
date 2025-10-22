import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import MentorChatPanel from '../../components/Chat/MentorChatPanel';
import io from 'socket.io-client';

const getBackendUrl = () => {
	try { const { protocol, hostname } = window.location; return `${protocol}//${hostname}:5000` } catch { return '' }
}

export default function MentorChatPage(){
	const { user } = UserAuth();
	const navigate = useNavigate();
	const [unread, setUnread] = useState(0);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const socket = useMemo(() => io(getBackendUrl(), { transports: ['websocket','polling'] }), []);

	useEffect(() => {
		if (!user?.email) return;
		const email = (user.email||'').toLowerCase();
		socket.emit('join', { roomId: `mentor:${email}`, userEmail: email });
		const onNotify = () => setUnread(n => n + 1);
		socket.on('notify', onNotify);
		return () => {
			socket.off('notify', onNotify);
			socket.disconnect();
		}
	}, [socket, user]);

	useEffect(() => {
		const badge = document.getElementById('mentor-chat-badge');
		if (badge){
			if (unread > 0) { badge.style.display = 'inline-flex'; badge.textContent = String(unread); }
			else { badge.style.display = 'none'; }
		}
	}, [unread]);

	// Reset sidebar badge when on chat page
	useEffect(() => {
		setUnread(0);
		const badge = document.getElementById('mentor-chat-badge');
		if (badge) badge.style.display = 'none';
	}, []);

	return (
		<div className="mentor-shell mentor-chat-page">
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
				<div className="sidebar-header"><span className="brand">Mentor Panel</span></div>
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
					<button className="nav-item active">
						<span role="img" aria-label="chat">💬</span>
						<span>Chat</span>
						<span id="mentor-chat-badge" className="badge" style={{ marginLeft: 8, display: 'none' }}>0</span>
					</button>
					<button className="nav-item logout-btn" onClick={() => {
						// Add logout functionality here if needed
						navigate('/');
					}}>
						<span role="img" aria-label="logout">🚪</span>
						<span>Logout</span>
					</button>
				</nav>
			</aside>
			<div className="mentor-main mentor-chat-main">
				<MentorChatPanel />
			</div>
		</div>
	)
}


