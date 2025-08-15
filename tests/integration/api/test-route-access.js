// Simple test to check if the auth-test route is accessible
import axios from 'axios';

async function testRouteAccess() {
  try {
    const response = await axios.get('http://localhost:5000/admin/auth-test');
    console.log('✅ Route /admin/auth-test is accessible');
    console.log('Status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Route /admin/auth-test is not accessible');
    console.log('Error:', error.message);
    return false;
  }
}

testRouteAccess();