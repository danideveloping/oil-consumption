const axios = require('axios');

async function testMachineryCreation() {
  try {
    console.log('🧪 Testing machinery creation...');
    
    // Test data
    const testData = {
      name: 'Test Machinery',
      type: null,
      place_id: 1,
      capacity: null,
      description: null
    };
    
    console.log('Sending data:', testData);
    
    // Make request to the API
    const response = await axios.post('http://localhost:5000/oil/api/machinery', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this with a real token
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testMachineryCreation(); 