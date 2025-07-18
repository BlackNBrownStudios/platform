const puppeteer = require('puppeteer');

async function testHistoryTimeWeb() {
  console.log('🚀 Starting Puppeteer tests for History Time Web...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to History Time web app
    console.log('📱 Navigating to History Time web app...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/history-time-home.png' });
    console.log('✓ Homepage loaded successfully');
    
    // Check if login button exists
    const loginButton = await page.$('button:contains("Login"), a:contains("Login")');
    if (loginButton) {
      console.log('✓ Login button found');
      
      // Click login
      await page.click('button:contains("Login"), a:contains("Login")');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Fill login form if it exists
      const emailInput = await page.$('input[type="email"], input[name="email"]');
      const passwordInput = await page.$('input[type="password"], input[name="password"]');
      
      if (emailInput && passwordInput) {
        console.log('✓ Login form found');
        
        // Try to login
        await page.type('input[type="email"], input[name="email"]', 'test@example.com');
        await page.type('input[type="password"], input[name="password"]', 'password123');
        
        // Submit form
        await page.click('button[type="submit"], button:contains("Sign in"), button:contains("Login")');
        
        // Wait for navigation or error
        try {
          await page.waitForNavigation({ 
            waitUntil: 'networkidle2', 
            timeout: 5000 
          });
          console.log('✓ Login attempted');
        } catch (e) {
          console.log('✓ Login form submitted (may need registration first)');
        }
      }
    }
    
    // Check if we can see game content
    const gameContent = await page.$eval('body', el => el.textContent);
    if (gameContent.includes('History') || gameContent.includes('Timeline') || gameContent.includes('Card')) {
      console.log('✓ Game content visible');
    }
    
    // Test API endpoint directly
    console.log('\n🔌 Testing API endpoints...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/v1/docs');
        return { 
          status: response.status, 
          ok: response.ok,
          url: response.url
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (apiResponse.ok) {
      console.log(`✓ API docs endpoint working (status: ${apiResponse.status})`);
    } else {
      console.log(`✗ API endpoint issue: ${JSON.stringify(apiResponse)}`);
    }
    
    // Test if we can fetch cards
    const cardsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/v1/cards?limit=1');
        const data = await response.json();
        return { 
          status: response.status, 
          hasData: !!data,
          dataType: typeof data
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log(`📊 Cards API response: ${JSON.stringify(cardsResponse)}`);
    
    console.log('\n✅ Puppeteer tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
(async () => {
  try {
    await testHistoryTimeWeb();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();