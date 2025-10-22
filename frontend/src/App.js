
import { Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Protected from "./firebase/Protected";
import AdminProtected from "./firebase/AdminProtected";
import MentorProtected from "./firebase/MentorProtected";
import MentorRedirect from "./components/MentorRedirect/MentorRedirect";
import Home from "./pages/Home/Home";
import Admin from "./pages/Admin/Admin";
import Mentor from "./pages/Mentor/Mentor";
import MentorDashboard from "./pages/Mentor/MentorDashboard";
import MentorNoticePage from "./pages/Mentor/MentorNoticePage";
import MentorChatPage from "./pages/Mentor/MentorChatPage";
import ManageAds from "./pages/Mentor/ManageAds";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import Evaluation from "./pages/Evaluation/Evaluation";
import PreInterview from "./pages/PreInterview/PreInterview";
import Interview from "./pages/Interview/Interview";
import Finish from "./pages/Finish/Finish";
import Contact from "./pages/Contact/Contact";
import About from "./pages/About/About";
import ChatPage from "./pages/Chat/ChatPage";
import NoticePage from "./pages/Notice/NoticePage";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add custom cursor styles for interactive elements
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: default;
      }
      button, a, [role="button"], input, select, textarea {
        cursor: pointer;
      }
      input[type="text"], input[type="email"], input[type="password"], textarea {
        cursor: text;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthContextProvider>
        <MentorRedirect>
          <div className="app">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/home" element={<Protected><Home /></Protected>} />
              <Route path="/admin" element={<AdminProtected><Admin /></AdminProtected>} />
              <Route path="/mentor" element={<MentorProtected><Mentor /></MentorProtected>} />
              <Route path="/mentor/dashboard" element={<MentorProtected><MentorDashboard /></MentorProtected>} />
              <Route path="/mentor/manage-ads" element={<MentorProtected><ManageAds /></MentorProtected>} />
              <Route path="/mentor/notices" element={<MentorProtected><MentorNoticePage /></MentorProtected>} />
              <Route path="/mentor/chat" element={<MentorProtected><MentorChatPage /></MentorProtected>} />
              <Route path="/evaluation" element={<Protected><Evaluation /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
              <Route path="/notice" element={<Protected><NoticePage /></Protected>} />
              <Route path='/interview/:id' element={<Protected><PreInterview /></Protected>} />
              <Route path='/interview/:id/start' element={<Protected><Interview /></Protected>} />
              <Route path='/interview/:id/finish' element={<Protected><Finish /></Protected>} />
            </Routes>
            {/* Theme toggle removed for single-theme setup */}
          </div>
        </MentorRedirect>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

