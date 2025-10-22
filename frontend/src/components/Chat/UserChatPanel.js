import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import './MentorChatPanel.css';
import { UserAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

const getBackendUrl = () => {
	try { const { protocol, hostname } = window.location; return `${protocol}//${hostname}:5000` } catch { return '' }
}

export default function UserChatPanel(){
	const { user } = UserAuth();
	const userEmail = (user?.email || '').toLowerCase();
	const roomId = userEmail ? `dm:${userEmail}` : '';
	const [mentorEmail, setMentorEmail] = useState('');
	const [lastContent, setLastContent] = useState('');
	const [lastAt, setLastAt] = useState(null);
	const [active, setActive] = useState(null);
	const socketRef = useRef(null);

	useEffect(() => {
		fetch('/mentor')
			.then(r => r.ok ? r.json() : [])
			.then(list => {
				const first = Array.isArray(list) && list.length ? list[0] : null;
				const email = (first?.email || first?.credentials?.email || '').toLowerCase();
				if (email) setMentorEmail(email);
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!roomId) return;
		// load last message preview
		fetch(`/chat/history/${encodeURIComponent(roomId)}?limit=1`)
			.then(r=>r.json())
			.then(list => {
				const m = (list||[])[0];
				if (m) { setLastContent(m.content || ''); setLastAt(m.createdAt || null); }
			})
			.catch(()=>{});
	}, [roomId]);

	// Realtime updates for preview; do not auto-open
	useEffect(() => {
		if (!roomId) return;
		if (!socketRef.current) socketRef.current = io(getBackendUrl(), { transports: ['websocket','polling'] });
		const socket = socketRef.current;
		socket.emit('join', { roomId, userEmail });
		const onMessage = (m) => {
			if (m?.roomId !== roomId) return;
			setLastContent(m.content || '');
			setLastAt(m.createdAt || Date.now());
		};
		socket.on('message', onMessage);
		return () => { socket.off('message', onMessage) };
	}, [roomId, userEmail]);

	return (
		<div className="mentor-chat-shell">
			<aside className="mentor-chat-sidebar">
				<div className="sidebar-header">Chats</div>
				<div className="conversation-list">
					<button className={`conversation-item ${active?.roomId===roomId?'active':''}`} onClick={() => setActive({ roomId, otherEmail: mentorEmail })}>
						<div className="avatar">👨‍🏫</div>
						<div className="meta">
							<div className="name">Mentor</div>
							<div className="preview">{lastContent || 'Say hi to your mentor'}</div>
						</div>
						<div className="time">{lastAt ? new Date(lastAt).toLocaleTimeString() : ''}</div>
					</button>
				</div>
			</aside>
			<main className="mentor-chat-main">
				{active ? (
					<ChatWindow roomId={roomId} peerLabel="Mentor" recipientEmail={mentorEmail} />
				) : (
					<div className="placeholder">Select a chat to start messaging</div>
				)}
			</main>
		</div>
	)
}


