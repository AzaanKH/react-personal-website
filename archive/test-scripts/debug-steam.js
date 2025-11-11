// Debug Steam API - Run this in browser console
window.testSteamAPI = async function() {
  console.log('🧪 Testing Steam API endpoints...');
  
  // First test the simple test function
  try {
    console.log('🔗 Testing simple steam-test function...');
    const testResponse = await fetch('/.netlify/functions/steam-test');
    console.log('📡 Steam test response:', {
      status: testResponse.status,
      statusText: testResponse.statusText
    });
    
    const testText = await testResponse.text();
    console.log('📄 Steam test raw response:', testText);
    
    try {
      const testJson = JSON.parse(testText);
      console.log('✅ Steam test parsed response:', testJson);
    } catch (e) {
      console.error('❌ Failed to parse steam-test JSON:', e);
    }
  } catch (error) {
    console.error('💥 Steam test function error:', error);
  }
  
  console.log('\n--- Now testing actual Steam endpoints ---\n');
  
  const endpoints = ['profile', 'recent'];
  
  for (const endpoint of endpoints) {
    try {
      const url = `/.netlify/functions/steam-proxy?endpoint=${endpoint}`;
      console.log(`🔗 Testing: ${url}`);
      
      const response = await fetch(url);
      console.log(`📡 Response for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const text = await response.text();
      console.log(`📄 Raw response for ${endpoint}:`, text);
      
      try {
        const json = JSON.parse(text);
        console.log(`✅ Parsed JSON for ${endpoint}:`, json);
      } catch (e) {
        console.error(`❌ Failed to parse JSON for ${endpoint}:`, e);
      }
      
    } catch (error) {
      console.error(`💥 Network error for ${endpoint}:`, error);
    }
  }
};

console.log('🚀 Debug function loaded! Run window.testSteamAPI() to test Steam endpoints');