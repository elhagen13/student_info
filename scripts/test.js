const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');


async function test() {
    let driver = await new Builder().forBrowser("firefox").build();

    try {
        await driver.get("https://myportal.calpoly.edu/");
        // Go to the Cal Poly portal (user logs in manually)
        const testHTML = await driver.getPageSource()
        console.log(testHTML);
    } finally {
        await driver.quit();
    }
}


test();
