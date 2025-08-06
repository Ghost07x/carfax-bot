const { chromium } = require('playwright');
require('dotenv').config();
const path = require('path');

(async () => {
  const vin = process.argv[2]; // Pass VIN via command line: node index.js <VIN>

  if (!vin) {
    console.error('❌ Please provide a VIN as a command-line argument.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Logging into Carfax...');
    await page.goto('https://www.carfaxonline.com/');
    await page.fill('#username', process.env.CARFAX_USER);
    await page.fill('#password', process.env.CARFAX_PASS);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

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
