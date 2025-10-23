import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './Finish.css';
import { UserAuth } from '../../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AIFeedback from '../../components/AIFeedback/AIFeedback';

const EnhancedFinish = () => {
  const { user } = UserAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const feedback = queryParams.get('feedback') || 'No feedback available';
  const score = queryParams.get('score') || '0';
  const rawScores = queryParams.get('scores');
  const { id } = useParams();

  const [intDetails, setIntDetails] = useState(null);
  const [isUserFetched, setIsUserFetched] = useState(false);
  const [isIntDetailsSet, setIsIntDetailsSet] = useState(false);
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewAnswers, setInterviewAnswers] = useState([]);

  const topicBreakdown = (() => {
    try {
      const arr = JSON.parse(decodeURIComponent(rawScores || '')) || []
      console.log('Raw scores array:', arr);
      
      const totals = {}
      const counts = {}
      for (const entry of arr) {
        const [t, s] = String(entry).split(':')
        const topic = (t || '').trim()
        const val = Number(String(s || '').replace(/[^0-9]/g, '')) || 0
        if (!topic) continue
        totals[topic] = (totals[topic] || 0) + val
        counts[topic] = (counts[topic] || 0) + 1
      }
      
      const breakdown = Object.entries(totals).map(([topic, total]) => ({
        topic,
        avg: Math.round(total / (counts[topic] || 1))
      }))
      
      console.log('Topic breakdown:', breakdown);
      return breakdown;
    } catch (error) {
      console.error('Error parsing topic breakdown:', error);
      return []
    }
  })()

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        const response = await axios.get(`/interview/${id}`);
        setIntDetails(response.data);
        setIsIntDetailsSet(true);
        
        // Extract questions and answers for AI feedback
        if (response.data.questions) {
          setInterviewQuestions(response.data.questions);
        }
        if (response.data.answers) {
          setInterviewAnswers(response.data.answers);
        }
      } catch (error) {
        console.error('Error fetching interview data:', error);
      }
    };
    
    fetchInterviewData();
  }, [id]);

  useEffect(() => {
    if (user && isIntDetailsSet && !isUserFetched) {
      const uintData = {
        uid: user.uid,
        company: intDetails.company,
        role: intDetails.role,
        type: intDetails.type,
        score: score,
        feedback: feedback,
      };

      const sendUserInterviewData = async () => {
        try {
          await axios.post(`/userInterview`, uintData);
          setIntDetails((prevState) => ({
            ...prevState,
            sent: true,
          }));
        } catch (error) {
          console.error('Error sending user interview data:', error);
        }
      };

      sendUserInterviewData();
      setIsUserFetched(true);
      
      const updateScore = async () => {
        try {
          await axios.patch(`/user/score/${user.uid}`, score)
        } catch (error) {
          console.log(error);
        }
      }
      updateScore()
    }
  }, [user, intDetails, score, feedback, isIntDetailsSet, isUserFetched]);

  useEffect(() => {
    document.title = 'Summary';
  }, []);

  const handleGenerateAIFeedback = () => {
    setShowAIFeedback(true);
  };

  return (
    <div className="finish-container">
      <div className="success-container">
        <CheckCircleIcon sx={{ fontSize: 84, color: '#22c55e' }} />
        <h2>Great work! Your interview has been submitted successfully.</h2>
      </div>
      
      <div className="int-evaluation">
        <h1>Evaluation</h1>
        <div className="score">
          <div className="pill">Overall Score: <span style={{marginLeft:8, color:'#ffffff'}}>{score} out of 100</span></div>
          {intDetails && (
            <div className="meta">{intDetails.company} • {intDetails.role} • {intDetails.type || 'Interview'}</div>
          )}
        </div>
        
        {topicBreakdown.length > 0 && (
          <div className="breakdown">
            <h3>Topic-wise Breakdown</h3>
            <ul>
              {topicBreakdown.map((b, idx) => (
                <li key={idx}>
                  <span className="topic-chip">{b.topic}</span>
                  <div className="bar"><span style={{ width: `${Math.min(100, Math.max(0, b.avg))}%` }} /></div>
                  <span className="percent">{b.avg}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="feedback">
          <h2>Feedback</h2>
          <p>{feedback}</p>
        </div>

        {/* AI-Powered Feedback Section */}
        <div className="ai-feedback-section">
          <div className="ai-feedback-header">
            <h2>🤖 AI-Powered Analysis</h2>
            <p>Get detailed insights and recommendations powered by advanced AI</p>
            {!showAIFeedback && (
              <button 
                className="generate-ai-feedback-btn"
                onClick={handleGenerateAIFeedback}
              >
                Generate AI Feedback
              </button>
            )}
          </div>
          
          {showAIFeedback && (
            <AIFeedback
              interviewId={id}
              questions={interviewQuestions}
              answers={interviewAnswers}
              company={intDetails?.company}
              position={intDetails?.role}
              topics={topicBreakdown.map(t => t.topic)}
            />
          )}
        </div>
      </div>
      
      <div className="go-back">
        <Link className="home-button" to="/home">Home</Link>
      </div>
    </div>
  );
};

export default EnhancedFinish;


