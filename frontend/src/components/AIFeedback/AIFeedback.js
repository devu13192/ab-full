import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIFeedback.css';

const AIFeedback = ({ interviewId, questions, answers, company, position, topics }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/interview-feedback', {
        interviewData: {
          interviewId,
          timestamp: new Date().toISOString()
        },
        questions,
        answers,
        company: company || 'Google',
        position: position || 'Software Engineer',
        topics: topics || ['Algorithms', 'Data Structures']
      });

      setFeedback(response.data);
    } catch (err) {
      console.error('Error generating feedback:', err);
      setError('Failed to generate feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions && answers && questions.length > 0 && answers.length > 0) {
      generateFeedback();
    }
  }, [interviewId, questions, answers, company, position, topics]);

  if (loading) {
    return (
      <div className="ai-feedback-loading">
        <div className="loading-spinner"></div>
        <p>Generating AI-powered feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-feedback-error">
        <p>{error}</p>
        <button onClick={generateFeedback} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className="ai-feedback-container">
      <div className="evaluation-section">
        <h1>AI-Powered Evaluation</h1>
        <div className="score-section">
          <div className="overall-score">
            Overall Score: <span className="score-value">{feedback.overallScore} out of 100</span>
          </div>
          <div className="interview-meta">
            {company} • {position} • AI Analysis
          </div>
        </div>

        {feedback.topicBreakdown && Object.keys(feedback.topicBreakdown).length > 0 && (
          <div className="topic-breakdown">
            <h3>Topic-wise Breakdown</h3>
            <div className="breakdown-list">
              {Object.entries(feedback.topicBreakdown).map(([topic, score]) => (
                <div key={topic} className="breakdown-item">
                  <div className="topic-info">
                    <span className="topic-name">{topic}</span>
                    <span className="topic-score">{score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="feedback-section">
          <h3>Detailed Feedback</h3>
          <div className="feedback-content">
            <p>{feedback.detailedFeedback}</p>
          </div>
        </div>

        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="strengths-section">
            <h4>Strengths</h4>
            <ul className="strengths-list">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="strength-item">
                  <span className="strength-icon">✅</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
          <div className="improvement-section">
            <h4>Areas for Improvement</h4>
            <ul className="improvement-list">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="improvement-item">
                  <span className="improvement-icon">🔧</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.recommendations && feedback.recommendations.length > 0 && (
          <div className="recommendations-section">
            <h4>Recommendations</h4>
            <ul className="recommendations-list">
              {feedback.recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">
                  <span className="recommendation-icon">💡</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFeedback;


