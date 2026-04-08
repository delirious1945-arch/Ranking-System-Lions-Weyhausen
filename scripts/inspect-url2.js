const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://2k-dart-software.com/frontend/events/10/event/251/phase/235/group/0';
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const elements = await page.evaluate(() => {
        const results = [];
        let currentSpieltag = "";
        
        // Find all elements that might tell us about the schedule
        const nodes = document.querySelectorAll('.page-content app-league, h4, p-table tbody tr');
        
        // The page structure might be complex. Let's just find th with "Spieltag"
        const ths = Array.from(document.querySelectorAll('th'));
        for (const th of ths) {
            if (th.innerText.includes('Spieltag')) {
                // Find next rows
                let next = th.parentElement.nextElementSibling;
                while (next) {
                    const matchText = next.innerText.trim();
                    const links = Array.from(next.querySelectorAll('a')).map(a => a.href);
                    results.push({
                        spieltag: th.innerText,
                        match: matchText,
                        links
                    });
                    next = next.nextElementSibling;
                    if (next && next.querySelector('th')) break; // Next spieltag block
                }
            }
        }
        return results;
    });

    console.log(JSON.stringify(elements.slice(0, 5), null, 2));
    await browser.close();
})();
