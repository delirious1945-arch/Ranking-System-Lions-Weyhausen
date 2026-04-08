const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://2k-dart-software.com/frontend/events/10/event/251/phase/235/group/0';
    
    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // We want to find the "Spielplan" tab or similar schedule list
    // Let's print the entire text to see if there are "Spieltag" sections or Match IDs.
    const text = await page.evaluate(() => {
        // Collect all headers and table rows for context
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, th, td, a'));
        return elements.map(e => e.innerText?.trim() + (e.href ? ' ('+e.href+')' : '')).filter(t => t.length > 0);
    });

    console.log(text.slice(0, 100)); // First 100 useful texts
    await browser.close();
})();
