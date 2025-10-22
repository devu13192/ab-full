import React, { useEffect, useState } from 'react';
import UserChatPanel from '../../components/Chat/UserChatPanel';
import { UserAuth } from '../../context/AuthContext';
import ProfessionalNavbar from '../../components/Navbar/ProfessionalNavbar';
import './ChatPage.css';

export default function ChatPage(){
    const { user } = UserAuth();
    // No auto-opening: the user picks the conversation inside the panel
    return (
		<>
			<ProfessionalNavbar />
			<div className="chat-page-container">
				<div className="chat-page-panel">
					<UserChatPanel />
				</div>
			</div>
		</>
	)
}


