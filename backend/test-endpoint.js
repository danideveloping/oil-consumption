const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Testing machinery endpoint...');
    
    // Test GET endpoint (should work without auth)
    const response = await axios.get('http://localhost:5000/api/machinery');
    console.log('✅ GET endpoint works! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Backend server is not running! Start it with: npm run dev');
    }
  }
}

testEndpoint(); 