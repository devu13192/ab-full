
import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Protected from "./firebase/Protected";
import AdminProtected from "./firebase/AdminProtected";
import MentorProtected from "./firebase/MentorProtected";
import MentorRedirect from "./components/MentorRedirect/MentorRedirect";
import LoadingComponent from "./components/LoadingComponent/LoadingComponent";

// Lazy load pages to improve initial bundle size
const Home = lazy(() => import("./pages/Home/Home"));
const Admin = lazy(() => import("./pages/Admin/Admin"));
const Mentor = lazy(() => import("./pages/Mentor/Mentor"));
const MentorDashboard = lazy(() => import("./pages/Mentor/MentorDashboard"));
const MentorNoticePage = lazy(() => import("./pages/Mentor/MentorNoticePage"));
const MentorChatPage = lazy(() => import("./pages/Mentor/MentorChatPage"));
const ManageAds = lazy(() => import("./pages/Mentor/ManageAds"));
const Landing = lazy(() => import("./pages/Landing/Landing"));
const Login = lazy(() => import("./pages/Login/Login"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Evaluation = lazy(() => import("./pages/Evaluation/Evaluation"));
const PreInterview = lazy(() => import("./pages/PreInterview/PreInterview"));
const Interview = lazy(() => import("./pages/Interview/Interview"));
const EnhancedFinish = lazy(() => import("./pages/Finish/EnhancedFinish"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const About = lazy(() => import("./pages/About/About"));
const ChatPage = lazy(() => import("./pages/Chat/ChatPage"));
const NoticePage = lazy(() => import("./pages/Notice/NoticePage"));

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
            <Suspense fallback={<LoadingComponent />}>
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
                <Route path='/interview/:id/finish' element={<Protected><EnhancedFinish /></Protected>} />
              </Routes>
            </Suspense>
          </div>
        </MentorRedirect>
      </AuthContextProvider>
    </ThemeProvider>
  );
}


