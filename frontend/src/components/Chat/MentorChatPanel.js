import React, { useEffect, useMemo, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import './MentorChatPanel.css';
import { UserAuth } from '../../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const getBackendUrl = () => {
	try { const { protocol, hostname } = window.location; return `${protocol}//${hostname}:5000` } catch { return '' }
}

export default function MentorChatPanel(){
	const { user } = UserAuth();
	const mentorEmail = (user?.email || '').toLowerCase();
	const [conversations, setConversations] = useState([]);
	const [active, setActive] = useState(null);
	const [search, setSearch] = useState('');
	const [emailToProfile, setEmailToProfile] = useState({}); // { email: { name, photoURL } }
    const socketRef = useRef(null);

	useEffect(() => {
		if (!mentorEmail) return;
		const load = () => {
			fetch('/chat/conversations')
				.then(r => r.json())
				.then(list => {
					const sorted = (list || []).slice().sort((a,b) => new Date(b.lastAt||0) - new Date(a.lastAt||0));
					setConversations(sorted);
				})
				.catch(()=>{});
		}
		load();
		const id = setInterval(load, 4000);
		return () => clearInterval(id);
	}, [mentorEmail]);

	// Load user directory once to map emails -> { name, photoURL }
	useEffect(() => {
		let cancelled = false;
		fetch('/user')
			.then(r => r.ok ? r.json() : [])
			.then(list => {
				if (cancelled) return;
				const map = {};
				(list || []).forEach(u => {
					const email = (u.email || u.credentials?.email || '').toLowerCase();
					if (!email) return;
					map[email] = {
						name: u.displayName || u.name || (email.split('@')[0] || 'User'),
						photoURL: u.photoURL || ''
					};
				});
				setEmailToProfile(map);
			})
			.catch(()=>{});
		return () => { cancelled = true };
	}, []);

    // Realtime bump-up on new messages
    useEffect(() => {
        if (!mentorEmail) return;
        if (!socketRef.current) {
            socketRef.current = io(getBackendUrl(), { transports: ['websocket','polling'] });
        }
        const socket = socketRef.current;
        socket.emit('join', { roomId: `mentor:${mentorEmail}`, userEmail: mentorEmail });
        const onNotify = (payload) => {
            const { roomId, lastContent, createdAt, from } = payload || {};
            if (!roomId) return;
            setConversations(prev => {
                const existing = prev.find(c => c.roomId === roomId);
                const updated = existing ? prev.map(c => c.roomId === roomId ? {
                    ...c,
                    lastContent: lastContent || c.lastContent,
                    lastAt: createdAt || c.lastAt,
                    otherEmail: c.otherEmail || from || '' ,
                    unreadCount: (active && active.roomId === roomId) ? 0 : Math.max(1, (c.unreadCount || 0) + 1)
                } : c) : [{ roomId, otherEmail: from || '', lastContent, lastAt: createdAt, unreadCount: (active && active.roomId === roomId) ? 0 : 1 }, ...prev];
                return updated.slice().sort((a,b) => new Date(b.lastAt||0) - new Date(a.lastAt||0));
            });
        };
        socket.on('notify', onNotify);
        return () => { socket.off('notify', onNotify); };
    }, [mentorEmail, active]);

	const filtered = useMemo(() => {
		const s = search.toLowerCase().trim();
		if (!s) return conversations;
		return conversations.filter(c => {
			const email = (c.otherEmail || '').toLowerCase();
			const prof = emailToProfile[email];
			const name = (prof?.name || email.split('@')[0] || '').toLowerCase();
			return name.includes(s);
		});
	}, [search, conversations, emailToProfile]);

	return (
		<div className="mentor-chat-shell">
			<aside className="mentor-chat-sidebar">
				<div className="sidebar-header">Messages</div>
				<div className="sidebar-search">
					<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users" />
				</div>
				<div className="conversation-list">
					{filtered.map(conv => (
						<button key={conv.roomId} className={`conversation-item ${active?.roomId===conv.roomId?'active':''}`} onClick={async ()=>{
							setActive(conv);
							try{ await axios.post('/chat/read', { roomId: conv.roomId, mentorEmail }); } catch {}
							// Clear unread count locally for immediate UX
							setConversations(prev => prev.map(c => c.roomId === conv.roomId ? { ...c, unreadCount: 0 } : c));
						}}>
							{(() => {
								const email = (conv.otherEmail || '').toLowerCase();
								const prof = emailToProfile[email] || {};
								const name = prof.name || 'Mentor';
								const photo = prof.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=64&background=6366f1&color=ffffff&bold=true`;
								return (
									<React.Fragment>
										<div className="avatar"><img src={photo} alt={name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} /></div>
										<div className="meta">
											<div className="name">{name}</div>
											<div className="preview">{conv.lastContent || ''}</div>
										</div>
									</React.Fragment>
								);
							})()}
							<div className="time">{conv.unreadCount > 0 ? <span className="badge">{conv.unreadCount}</span> : (conv.lastAt ? new Date(conv.lastAt).toLocaleTimeString() : '')}</div>
						</button>
					))}
					{filtered.length === 0 && (
						<div className="empty">No conversations yet.</div>
					)}
				</div>
			</aside>
			<main className="mentor-chat-main">
				{active ? (
					(() => {
						const email = (active.otherEmail || '').toLowerCase();
						const prof = emailToProfile[email] || {};
						const name = prof.name || 'Mentor';
						return <ChatWindow roomId={active.roomId} peerLabel={name} recipientEmail={active.otherEmail || ''} />
					})()
				) : (
					<div className="placeholder">Select a conversation</div>
				)}
			</main>
		</div>
	)
}


