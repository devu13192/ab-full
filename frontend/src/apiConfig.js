import axios from 'axios';

// Set the base URL for API calls. 
// In development, it uses the proxy from package.json or localhost.
// In production, it uses the hardcoded Render URL.
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : 'https://ab-full-hvzk.onrender.com';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export default API_BASE_URL;
