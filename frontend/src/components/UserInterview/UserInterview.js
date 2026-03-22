import React from 'react'
import "./UserInterview.css"

const UserIterview = ({interview}) => {
  // Extract score from feedback text
  const extractScoreFromFeedback = (feedback) => {
    // Prioritize the stored score from database
    if (interview.score !== null && interview.score !== undefined && interview.score > 0) {
      return interview.score;
    }
    
    // If stored score is 0 or invalid, don't try to extract from feedback
    // Just return 0 to indicate no score available
    return 0;
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
