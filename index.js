const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Setup Chrome options
const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless');  // Run in headless mode
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--disable-dev-shm-usage');
chromeOptions.addArguments('--disable-images');  // Optional: Disable image loading
chromeOptions.addArguments('--disable-javascript');  // Optional: Disable JavaScript for speed

(async function scrapeProducts() {
    // Initialize the WebDriver
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

    try {
        // Navigate to the target website
        await driver.get('https://www.google.co.in/search?tbm=shop&hl=en-IN&gl=IN&q=check+shirts');

        // Wait for the page to load
        // await driver.wait(until.titleIs('Google Shopping'), 20000);  // Wait for 20 seconds
  // Wait for title to be present

        // Initialize lists to store the data
        const fetchedProducts = [];
        const discounts = [];

        // Scrape discount elements
        const discountElements = await driver.findElements(By.css('.Ib8pOd'));
        for (let element of discountElements) {
            const discountText = await element.getText();
            discounts.push(discountText);
        }

        // Scrape product information
        const productElements = await driver.findElements(By.css('.sh-dgr__content'));

        for (let index = 0; index < productElements.length; index++) {
            const element = productElements[index];

            // Find product details inside each product element
            const productName = await element.findElement(By.css('.tAxDx')).getText();
            const price = await element.findElement(By.css('.a8Pemb')).getText();
            const origin = await element.findElement(By.css('.aULzUe')).getText();

            // Get the URL and image source
            let notororiginUrl, imgUrl;
            try {
                notororiginUrl = await element.findElement(By.css('.mnIHsc a')).getAttribute('href');
            } catch (error) {
                notororiginUrl = null;  // Handle case where href is missing
            }

            try {
                imgUrl = await element.findElement(By.css('.ArOc1c img')).getAttribute('src');
            } catch (error) {
                imgUrl = null;  // Handle case where img src is missing
            }

            // Add scraped data to the fetchedProducts list
            fetchedProducts.push({
                productName,
                price,
                discount: discounts[index] || 'none',
                origin,
                productUrl: notororiginUrl,
                imgUrl
            });
        }

        // Print the fetched products
        console.log(fetchedProducts);

        return fetchedProducts;
    } finally {
        // Close the browser session
        await driver.quit();
    }
})();
