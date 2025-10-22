import React from 'react'
import "./Card.css"

import NorthEastIcon from '@mui/icons-material/NorthEast';
import { Link } from 'react-router-dom';
const Card = ({data}) => {
    return (
        <div className="card">
          
              <h1>{data.company}</h1>
              <h2>{data.role}</h2>
              <Link to={`/interview/${data._id}`}><NorthEastIcon /></Link>
          
        </div>
      );
}

export default Card
