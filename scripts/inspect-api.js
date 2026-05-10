const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://2k-dart-software.com/frontend/events/10/event/251/phase/235/group/0';
    
    // We will listen to all network responses to see if there is an API call returning the schedule.
    page.on('response', async (response) => {
        const req = response.request();
        if (req.url().includes('api') || req.url().includes('schedule')) {
            try {
                const text = await response.text();
                // If the response is JSON, log it if it contains schedule info
                if (text.includes("spieltag") || text.includes("match") || text.includes("game")) {
                    console.log("FOUND API ENDPOINT:", req.url());
                    console.log("DATA PEEK:", text.slice(0, 500));
                }
            } catch (e) {
                // Ignore errors from binary files or closed responses
            }
        }
    });

    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    await browser.close();
})();
