import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { UserAuth } from '../../context/AuthContext';
import './NewMessageNotifier.css';

const getBackendUrl = () => {
	try { const { protocol, hostname } = window.location; return `${protocol}//${hostname}:5000` } catch { return '' }
}

export default function NewMessageNotifier(){
	const { user } = UserAuth();
	const navigate = useNavigate();
	const location = useLocation();
    const [toast, setToast] = useState(null);
    const socketRef = React.useRef(null);

    useEffect(() => {
        if (!user?.email) return;
        // Ensure single socket instance
        if (!socketRef.current) {
            socketRef.current = io(getBackendUrl(), { transports: ['websocket','polling'] });
        }
        const socket = socketRef.current;
        const email = (user.email||'').toLowerCase();
        socket.emit('join', { roomId: `mentor:${email}`, userEmail: email });
        const onNotify = (payload) => {
			// Skip toast if already on chat page
			if (location.pathname.startsWith('/mentor/chat')) return;
			setToast({
				from: payload?.from || 'User',
				content: payload?.lastContent || '',
				roomId: payload?.roomId || ''
			});
			try {
				const audio = new Audio('data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA//////////8AAAACAAACcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
				audio.play().catch(()=>{});
			} catch {}
			if ('Notification' in window) {
				try {
					if (Notification.permission === 'granted') {
						new Notification(`New message from ${payload?.from || 'User'}`, { body: payload?.lastContent || '' });
					} else if (Notification.permission === 'default') {
						Notification.requestPermission().catch(()=>{});
					}
				} catch {}
			}
        };
        socket.on('notify', onNotify);
        return () => {
            socket.off('notify', onNotify);
        }
    }, [user, location.pathname]);

	if (!toast) return null;

	return (
		<div className="msg-toast" onClick={() => { setToast(null); navigate('/mentor/chat'); }}>
			<div className="msg-title">New message</div>
			<div className="msg-from">{toast.from}</div>
			<div className="msg-body">{toast.content}</div>
		</div>
	)
}


