import React from 'react'
import "./Question.css"

const Question = ({ question }) => {
  return (
    <div className='question'>
      <h1>Q?</h1>
      <h3>{question}</h3>
    </div>
  )
}

export default Question


