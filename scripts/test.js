const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function test() {
    // Set Chrome options (e.g., headless mode)
    let options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode
    options.addArguments('--disable-gpu'); // Disable GPU acceleration
    options.addArguments('--no-sandbox'); // Disable sandbox for Linux

    // Build the WebDriver instance
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Navigate to the Cal Poly portal
        await driver.get("https://myportal.calpoly.edu/");

        // Get the page source and log it
        const testHTML = await driver.getPageSource();
        console.log(testHTML);
    } finally {
        // Quit the WebDriver session
        await driver.quit();
    }
}

test();