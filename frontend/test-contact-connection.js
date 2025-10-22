// Simple test to check if frontend can connect to backend
const testConnection = async () => {
  console.log('Testing frontend to backend connection...');
  
  try {
    const response = await fetch('http://localhost:5000/api/contacts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!', data);
    } else {
      console.log('❌ Connection failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
};

// Test POST request
const testPostConnection = async () => {
  console.log('Testing POST request...');
  
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    inquiryType: 'general',
    message: 'This is a test message from frontend.',
    consent: true
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ POST request successful!', data);
    } else {
      const errorData = await response.text();
      console.log('❌ POST request failed with status:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ POST request error:', error.message);
  }
};

// Run tests
testConnection();
setTimeout(() => testPostConnection(), 1000);
