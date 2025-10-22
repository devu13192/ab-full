import React from 'react'
import "./UserInterview.css"

const UserIterview = ({interview}) => {
  // Extract score from feedback text
  const extractScoreFromFeedback = (feedback) => {
    if (!feedback) return interview.score || 0;
    
    // Try multiple regex patterns to extract the score
    const patterns = [
      /Overall Performance:\s*(\d+)/i,
      /Overall Performance\s*:\s*(\d+)/i,
      /Overall Performance\s*(\d+)/i,
      /Performance:\s*(\d+)/i,
      /score\s*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = feedback.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }
    
    // If no pattern matches, try to find any number at the end of the feedback
    const numberMatch = feedback.match(/(\d+)(?:\s*$|\s*\.?\s*$)/);
    if (numberMatch && numberMatch[1]) {
      return parseInt(numberMatch[1]);
    }
    
    // Fallback to original score
    return interview.score || 0;
  };

  const extractedScore = extractScoreFromFeedback(interview.feedback);

  return (
    <div className='userInterview'>
      <div className='performance'>
        <h3>Company: <span>{interview.company}</span></h3>
        <h3>Role: <span>{interview.role}</span></h3>
        <h3>Score: <span>{extractedScore} out of 100</span></h3>
      </div>
      <div className='feedback-container'>
        <h3>Feedback</h3>
        <p>{interview.feedback}</p>
      </div>
    </div>
  )
}

export default UserIterview
