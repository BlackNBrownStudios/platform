const puppeteer = require('puppeteer');

async function testHistoryTimeBasic() {
  console.log('🚀 Starting basic Puppeteer tests for History Time...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to History Time web app
    console.log('📱 Testing History Time web app...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/history-time-home.png' });
    console.log('✓ Homepage loaded successfully');
    
    // Check page title
    const title = await page.title();
    console.log(`✓ Page title: ${title}`);
    
    // Check for main elements
    const hasStartButton = await page.$('button') !== null;
    console.log(`✓ Start button found: ${hasStartButton}`);
    
    // Test API endpoint directly
    console.log('\n🔌 Testing History Time API endpoints...');
    
    // Test docs endpoint
    const docsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/v1/docs/');
        return { 
          status: response.status, 
          ok: response.ok,
          url: response.url
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (docsResponse.ok) {
      console.log(`✓ API docs endpoint working (status: ${docsResponse.status})`);
    } else {
      console.log(`✗ API docs endpoint issue: ${JSON.stringify(docsResponse)}`);
    }
    
    // Test cards endpoint
    const cardsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/v1/cards?limit=1');
        if (!response.ok) {
          return { status: response.status, error: 'Not OK' };
        }
        const data = await response.json();
        return { 
          status: response.status, 
          hasData: !!data,
          resultsCount: data.results ? data.results.length : 0
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log(`✓ Cards API response: ${JSON.stringify(cardsResponse)}`);
    
    // Test DodginBalls API
    console.log('\n🔌 Testing DodginBalls API endpoints...');
    
    const dodginballsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3002/v1/docs/');
        return { 
          status: response.status, 
          ok: response.ok
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (dodginballsResponse.ok) {
      console.log(`✓ DodginBalls API docs endpoint working (status: ${dodginballsResponse.status})`);
    } else {
      console.log(`✗ DodginBalls API not available: ${JSON.stringify(dodginballsResponse)}`);
    }
    
    console.log('\n✅ Basic Puppeteer tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
(async () => {
  try {
    await testHistoryTimeBasic();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();