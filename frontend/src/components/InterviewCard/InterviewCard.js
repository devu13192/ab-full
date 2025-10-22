import "./InterviewCard.css"
import React from 'react'
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { Link } from "react-router-dom";
const InterviewCard = ({data}) => {
  return (
    <div className="interview-card">
      <h2>{data.company}</h2>
      <h2>{data.role}</h2>
      <Link to={`/interview/${data._id}`}><NorthEastIcon /></Link>
    </div>
  )
}

export default InterviewCard
