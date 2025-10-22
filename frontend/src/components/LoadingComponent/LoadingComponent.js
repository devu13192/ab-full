import React from 'react';
import './LoadingComponent.css'; // Import the CSS file for styling

const LoadingComponent = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default LoadingComponent;