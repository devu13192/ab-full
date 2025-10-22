import React, { useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './ChatWindow.css';
import { UserAuth } from '../../context/AuthContext';
import { 
	AttachFile, 
	Image, 
	Description, 
	Mic, 
	Send, 
	Download,
	Close,
	FilePresent,
	Audiotrack
} from '@mui/icons-material';

const getBackendUrl = () => {
	// Point socket to backend (assumes backend on 5000 during dev)
	try {
		const { protocol, hostname } = window.location
		return `${protocol}//${hostname}:5000`
	} catch {
		return ''
	}
}

export default function ChatWindow({ roomId, peerLabel, recipientEmail }){
	const { user } = UserAuth();
	const listRef = useRef(null);
	const fileInputRef = useRef(null);
	const [messages, setMessages] = useState([]);
	const [text, setText] = useState('');
	const [typingUsers, setTypingUsers] = useState({});
	const [showFileMenu, setShowFileMenu] = useState(false);
	const [uploadingFile, setUploadingFile] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isRecording, setIsRecording] = useState(false);
	const [mediaRecorder, setMediaRecorder] = useState(null);
	const [audioChunks, setAudioChunks] = useState([]);
	const tempIdRef = useRef(0);

	const socket = useMemo(() => io(getBackendUrl(), { transports: ['websocket', 'polling'] }), []);

	const resolveFileUrl = (url) => {
		try {
			if (!url) return url;
			if (/^https?:\/\//i.test(url)) return url;
			// Ensure files are loaded from backend origin (port 5000 in dev)
			return `${getBackendUrl()}${url.startsWith('/') ? url : `/${url}`}`;
		} catch {
			return url;
		}
	};

	// Lightweight custom voice player with waveform bars
	const VoiceBubble = ({ src, type }) => {
		const audioRef = useRef(null);
		const [playing, setPlaying] = useState(false);
		const [duration, setDuration] = useState(0);
		const [progress, setProgress] = useState(0);
		const bars = useMemo(() => {
			// Deterministic bar heights for visual waveform
			const count = 32;
			const out = [];
			let seed = 1337;
			const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
			for (let i = 0; i < count; i++) {
				const h = 8 + Math.round(rand() * 22); // 8..30px
				out.push(h);
			}
			return out;
		}, []);

		useEffect(() => {
			let raf = 0;
			const tick = () => {
				const a = audioRef.current;
				if (a && duration > 0) setProgress(a.currentTime / duration);
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
			return () => cancelAnimationFrame(raf);
		}, [duration]);

		const toggle = () => {
			const a = audioRef.current;
			if (!a) return;
			if (playing) { a.pause(); } else { a.play(); }
		};

		return (
			<div className={`voice-pill ${playing ? 'playing' : ''}`}>
				<button type="button" className="voice-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
					{playing ? '❚❚' : '▶'}
				</button>
				<div className="voice-bars">
					{bars.map((h, i) => {
						const filled = i / bars.length <= progress;
						return <span key={i} className={`bar ${filled ? 'filled' : ''}`} style={{ height: h }} />
					})}
				</div>
				<div className="voice-time">{duration ? new Date((duration - (audioRef.current?.currentTime||0)) * 1000).toISOString().substr(14,5) : '00:00'}</div>
				<audio 
					ref={audioRef} 
					src={src} 
					onPlay={() => setPlaying(true)} 
					onPause={() => setPlaying(false)} 
					onEnded={() => { setPlaying(false); setProgress(0); }}
					onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
					preload="metadata"
					style={{ display: 'none' }}
				/>
			</div>
		);
	};

	useEffect(() => {
		const email = user?.email || 'anonymous@copypro.local';
		socket.emit('join', { roomId, userEmail: email });
		fetch(`/chat/history/${encodeURIComponent(roomId)}?limit=100`).then(r=>r.json()).then(setMessages).catch(()=>{});

		const onMessage = (msg) => setMessages(prev => {
			// If this is a server-confirmed upload and we have a matching optimistic item, drop one optimistic
			if (msg?.fileInfo && (msg?.senderEmail === (user?.email || ''))) {
				const idx = prev.findIndex(p => p.isUploading && p.senderEmail === msg.senderEmail && p.fileInfo && p.fileInfo.fileType === msg.fileInfo.fileType);
				if (idx !== -1) {
					const clone = prev.slice();
					clone.splice(idx, 1);
					return [...clone, msg];
				}
			}
			return [...prev, msg];
		});
		const onJoined = () => {};
		const onTyping = ({ userEmail, typing }) => {
			setTypingUsers(prev => ({ ...prev, [userEmail]: typing }));
		};
		socket.on('message', onMessage);
		socket.on('joined', onJoined);
		socket.on('typing', onTyping);
		return () => {
			socket.off('message', onMessage);
			socket.off('joined', onJoined);
			socket.off('typing', onTyping);
			socket.disconnect();
		};
	}, [roomId, socket, user]);

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [messages]);

	const formatWhatsAppTime = (input) => {
		const d = new Date(input || Date.now());
		const now = new Date();
		const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
		const yesterday = new Date(now);
		yesterday.setDate(now.getDate() - 1);
		const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
		if (isSameDay(d, now)) return `Today ${time}`;
		if (isSameDay(d, yesterday)) return `Yesterday ${time}`;
		const sameYear = d.getFullYear() === now.getFullYear();
		const dateStr = d.toLocaleDateString([], { day: '2-digit', month: 'short', year: sameYear ? undefined : 'numeric' });
		return `${dateStr} ${time}`;
	};

	const sendMessage = async (e) => {
		e.preventDefault();
		const content = text.trim();
		if (!content || !recipientEmail) return;
		const senderEmail = user?.email || 'anonymous@copypro.local';
		const to = recipientEmail;
		// Send via HTTP (server will emit to room)
		try { await axios.post('/chat/send', { roomId, content, senderEmail, recipientEmail: to }) } catch {}
		setText('');
	};

	const handleFileSelect = (fileType) => {
		if (fileInputRef.current) {
			fileInputRef.current.accept = fileType;
			fileInputRef.current.click();
		}
		setShowFileMenu(false);
	};

	const handleFileUpload = async (event) => {
		const file = event.target.files[0];
		if (!file || !recipientEmail) return;

		// Validate file size (10MB limit)
		if (file.size > 10 * 1024 * 1024) {
			alert('File size must be less than 10MB');
			return;
		}

		// Validate file type
		const allowedTypes = {
			'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
			'audio/*': ['mp3', 'wav', 'ogg', 'm4a'],
			'application/pdf': ['pdf'],
			'application/msword': ['doc'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
			'text/plain': ['txt']
		};

		const fileExtension = file.name.split('.').pop().toLowerCase();
		const isValidType = Object.values(allowedTypes).some(extensions => 
			extensions.includes(fileExtension)
		);

		if (!isValidType) {
			alert('File type not supported. Please upload images, audio, PDF, or text files.');
			return;
		}

		setUploadingFile(true);
		setUploadProgress(0);

		// Optimistic preview message
		const tempId = `tmp-${Date.now()}-${tempIdRef.current++}`;
		const objectUrl = URL.createObjectURL(file);
		const optimisticMessage = {
			tempId,
			isUploading: true,
			roomId,
			createdAt: Date.now(),
			senderEmail: user?.email || 'anonymous@copypro.local',
			content: '',
			fileInfo: {
				fileUrl: objectUrl,
				fileName: file.name,
				fileType: file.type || 'application/octet-stream',
				fileSize: file.size
			}
		};
		setMessages(prev => [...prev, optimisticMessage]);

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('roomId', roomId);
			formData.append('senderEmail', user?.email || 'anonymous@copypro.local');
			formData.append('recipientEmail', recipientEmail);

			const response = await axios.post('/chat/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					setUploadProgress(percentCompleted);
				}
			});

			// Server will emit final message via socket; optimistic one will be removed in onMessage
		} catch (error) {
			console.error('File upload failed:', error);
			alert('Failed to upload file. Please try again.');
		} finally {
			setUploadingFile(false);
			setUploadProgress(0);
			// Clear the input
			event.target.value = '';
		}
	};

	const downloadFile = (fileInfo) => {
		if (fileInfo.fileUrl) {
			const link = document.createElement('a');
			link.href = fileInfo.fileUrl;
			link.download = fileInfo.fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const getFileIcon = (fileType) => {
		if (fileType.startsWith('image/')) return <Image />;
		if (fileType.startsWith('audio/')) return <Audiotrack />;
		if (fileType === 'application/pdf') return <Description />;
		return <FilePresent />;
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const startVoiceRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			const chunks = [];

			recorder.ondataavailable = (event) => {
				chunks.push(event.data);
			};

			recorder.onstop = async () => {
				const audioBlob = new Blob(chunks, { type: 'audio/webm' });
				await uploadVoiceNote(audioBlob);
				stream.getTracks().forEach(track => track.stop());
			};

			recorder.start();
			setMediaRecorder(recorder);
			setAudioChunks(chunks);
			setIsRecording(true);
		} catch (error) {
			console.error('Error starting voice recording:', error);
			alert('Could not access microphone. Please check permissions.');
		}
	};

	const stopVoiceRecording = () => {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			setIsRecording(false);
			setMediaRecorder(null);
			setAudioChunks([]);
		}
	};

	const uploadVoiceNote = async (audioBlob) => {
		if (!recipientEmail) return;

		// Optimistic voice note bubble
		const tempId = `tmp-${Date.now()}-${tempIdRef.current++}`;
		const objectUrl = URL.createObjectURL(audioBlob);
		setMessages(prev => [...prev, {
			tempId,
			isUploading: true,
			roomId,
			createdAt: Date.now(),
			senderEmail: user?.email || 'anonymous@copypro.local',
			content: '',
			fileInfo: {
				fileUrl: objectUrl,
				fileName: `voice-note-${Date.now()}.webm`,
				fileType: 'audio/webm',
				fileSize: audioBlob.size || 0
			}
		}]);

		setUploadingFile(true);
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append('file', audioBlob, `voice-note-${Date.now()}.webm`);
			formData.append('roomId', roomId);
			formData.append('senderEmail', user?.email || 'anonymous@copypro.local');
			formData.append('recipientEmail', recipientEmail);

			const response = await axios.post('/chat/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					setUploadProgress(percentCompleted);
				}
			});

			// Final message will be added via socket and optimistic one removed
		} catch (error) {
			console.error('Voice note upload failed:', error);
			alert('Failed to send voice note. Please try again.');
		} finally {
			setUploadingFile(false);
			setUploadProgress(0);
		}
	};

	const handleTyping = (val) => {
		setText(val);
		socket.emit('typing', { roomId, userEmail: user?.email || 'anon', typing: !!val });
	};

	const otherTyping = Object.entries(typingUsers).some(([email, flag]) => flag && email !== (user?.email || ''));

	return (
		<div className="chat-shell">
			<div className="chat-header">
				<div className="peer">
					<div className="avatar">👨‍🏫</div>
					<div className="meta">
						<div className="name">{peerLabel || 'Mentor'}</div>
						<div className="status">{otherTyping ? 'typing…' : 'online'}</div>
					</div>
				</div>
			</div>
			<div className="chat-list" ref={listRef}>
				{messages.map(m => {
					const mine = m.senderEmail === (user?.email || '');
					return (
						<div key={m._id || m.createdAt + m.senderEmail + Math.random()} className={mine ? 'msg mine' : 'msg'}>
							<div className="bubble">
								{m.fileInfo ? (
									<div className="file-message">
										<div className="file-preview">
									{m.fileInfo.fileType.startsWith('image/') ? (
						<img 
								src={resolveFileUrl(m.fileInfo.fileUrl)} 
											alt="image"
											className="file-image"
								onClick={() => window.open(resolveFileUrl(m.fileInfo.fileUrl), '_blank')}
										/>
						) : m.fileInfo.fileType.startsWith('audio/') ? (
							<VoiceBubble src={resolveFileUrl(m.fileInfo.fileUrl)} type={m.fileInfo.fileType || 'audio/webm'} />
									) : (
												<div className="file-info" onClick={() => downloadFile(m.fileInfo)}>
													<div className="file-icon">
														{getFileIcon(m.fileInfo.fileType)}
													</div>
													<div className="file-details">
												<div className="file-name">{m.fileInfo.fileName}</div>
												<div className="file-size">{formatFileSize(m.fileInfo.fileSize)}</div>
													</div>
													<div className="download-btn">
														<Download />
													</div>
												</div>
											)}
								</div>
								{/* Suppress content label for media messages */}
									</div>
								) : (
									<div className="content">{m.content}</div>
								)}
								<div className="time">{formatWhatsAppTime(m.createdAt)}</div>
							</div>
						</div>
					)
				})}
			</div>
			<form className="chat-input" onSubmit={sendMessage}>
				<div className="input-container">
					<input 
						value={text} 
						onChange={e => handleTyping(e.target.value)} 
						placeholder="Type a message" 
						disabled={uploadingFile}
					/>
					<div className="input-actions">
					<button 
						type="button" 
						className="attach-btn"
						onClick={() => setShowFileMenu(!showFileMenu)}
						disabled={uploadingFile}
						title="Attach file"
					>
						<AttachFile />
					</button>
					<button 
						type="button" 
						className={`mic-btn ${isRecording ? 'recording' : ''}`}
						onClick={() => {
							if (isRecording) {
								stopVoiceRecording();
							} else {
								startVoiceRecording();
							}
						}}
						disabled={uploadingFile}
						title={isRecording ? 'Stop recording' : 'Record voice note'}
					>
						<Mic />
					</button>
						{showFileMenu && (
							<div className="file-menu">
								<button 
									type="button" 
									className="file-option"
									onClick={() => handleFileSelect('image/*')}
								>
									<Image /> Photos
								</button>
								<button 
									type="button" 
									className="file-option"
									onClick={() => handleFileSelect('audio/*')}
								>
									<Audiotrack /> Audio Files
								</button>
							{/* Voice note action moved next to the attach icon */}
								<button 
									type="button" 
									className="file-option"
									onClick={() => handleFileSelect('application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain')}
								>
									<Description /> Documents
								</button>
							</div>
						)}
						<button 
							type="submit" 
							className="send-btn"
							disabled={uploadingFile || !text.trim()}
						>
							<Send />
						</button>
					</div>
				</div>
				{isRecording && (
					<div className="recording-indicator">
						<div className="recording-dot"></div>
						<span>Recording voice note... Click "Stop Recording" to finish</span>
					</div>
				)}
				{uploadingFile && (
					<div className="upload-progress">
						<div className="progress-bar">
							<div 
								className="progress-fill" 
								style={{ width: `${uploadProgress}%` }}
							></div>
						</div>
						<span className="progress-text">Uploading... {uploadProgress}%</span>
					</div>
				)}
				<input 
					type="file" 
					ref={fileInputRef} 
					onChange={handleFileUpload}
					style={{ display: 'none' }}
				/>
			</form>
		</div>
	);
}


