import axios from 'axios';

// Set the base URL for API calls. 
// In development, it uses the proxy from package.json or localhost.
// In production, it uses the hardcoded Render URL.
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ab-full.onrender.com' 
  : ''; // Use empty string to leverage the CRA proxy in development

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export default API_BASE_URL;
