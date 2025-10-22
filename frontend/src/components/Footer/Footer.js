import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p style={textStyle}>This is the beta version of the app.</p>
    </footer>
  );
};

// CSS styles for the footer
const footerStyle = {
  backgroundColor: '#d8c593',
  color: '#fff',
  padding: '1rem',
  textAlign: 'center',
};

const textStyle = {
  margin: 0,
};

export default Footer;
