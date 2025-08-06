const { chromium } = require('playwright');
require('dotenv').config();
const path = require('path');

(async () => {
  const vin = process.env.VIN || process.argv[2];

if (!vin) {
  console.error('❌ No VIN provided. Pass it as an argument or set VIN env var.');
  process.exit(1);
}

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Navigating to Carfax login...');

    // Step 1: Start at the normal login redirect page
    await page.goto('https://www.carfaxonline.com/');

    // Step 2: Wait for redirect to Auth0 login form
    await page.waitForURL('**auth.carfax.com/u/login**');

    // Step 3: Fill out the Auth0 form
    await page.fill('input[name="email"]', process.env.CARFAX_USER);
    await page.fill('input[name="password"]', process.env.CARFAX_PASS);

    // Step 4: Submit and wait for redirect back to Carfax dashboard
    await page.click('button[name="action"]'); // "Log In" button
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    console.log('✅ Logged in successfully!');


    console.log(`🔍 Searching for VIN: ${vin}...`);
    await page.goto('https://www.carfaxonline.com/vhr/search');
    await page.fill('#vin', vin);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    console.log('📸 Capturing screenshot...');
    const today = new Date().toISOString().split('T')[0];
    const outputPath = path.join(__dirname, `carfax_${vin}_${today}.png`);
    await page.waitForSelector('#reportHeader, .reportHeader, h1'); // fallback selectors
    await page.screenshot({ path: outputPath, fullPage: false });

    console.log(`✅ Screenshot saved at: ${outputPath}`);
  } catch (err) {
    console.error('❌ Error occurred:', err);
  } finally {
    await browser.close();
  }
})();
