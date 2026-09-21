const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting browser test...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    // Navigate to the local server
    await page.goto('http://127.0.0.1:5000/', { waitUntil: 'networkidle0' });
    console.log("Page loaded.");
    
    // Wait for the ToDo section button to be clickable
    await page.waitForSelector('.summary-link[data-section="tasks"]', { visible: true, timeout: 5000 });
    console.log("Found Tasks section. Clicking it...");
    await page.click('.summary-link[data-section="tasks"]');
    
    // Wait for the modal to open
    await page.waitForSelector('#section-modal-overlay.active', { visible: true, timeout: 5000 });
    console.log("Modal opened.");
    
    // Wait for a task topic block to appear and click it
    await page.waitForSelector('.topic-block', { visible: true, timeout: 5000 });
    console.log("Found a task item. Clicking it to open details...");
    
    // Click the first topic block
    await page.click('.topic-block');
    
    // Wait for the detail view to render (looking for the back button to appear)
    await page.waitForSelector('.topic-back-btn', { visible: true, timeout: 5000 });
    console.log("Task details opened successfully.");
    
    // Check if there are reaction toggle buttons
    const reactBtns = await page.$$('.react-toggle-btn');
    if (reactBtns.length === 0) {
      console.log("No reaction buttons found on this task. We might need a mock task with subtasks/comments.");
    } else {
      console.log(`Found ${reactBtns.length} reaction buttons. Clicking the first one...`);
      // Click the first one to toggle the menu
      await reactBtns[0].click();
      
      // Look for the reaction menu to become visible
      await page.waitForSelector('.reaction-menu:not([hidden])', { visible: true, timeout: 2000 });
      console.log("Reaction menu opened successfully!");
      
      // Click a reaction option (👍)
      await page.click('.reaction-menu:not([hidden]) .reaction-choice-btn[data-reaction="1"]');
      console.log("Clicked reaction option successfully!");
    }

    console.log("✅ Browser test passed!");
  } catch (err) {
    console.error("❌ Browser test failed:", err);
  } finally {
    await browser.close();
  }
})();
