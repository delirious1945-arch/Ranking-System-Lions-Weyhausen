const puppeteer = require('puppeteer');

const EVENTS = [
    { id: 247, name: 'Lions A', teams: ['Lions Weyhausen A'], alwaysInclude: [] },
    { id: 251, name: 'Lions B', teams: ['Lions Weyhausen B'], alwaysInclude: [] },
    { id: 239, name: 'Jens Liga', teams: [], alwaysInclude: ['Jens Goltermann'] },
];

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    for (const ev of EVENTS) {
        const base = `https://2k-dart-software.com/frontend/events/10/event/${ev.id}`;

        console.log(`\n=== Event ${ev.id} (${ev.name}) ===`);

        // Stats page
        await page.goto(`${base}/statistics/statistics`, { waitUntil: 'networkidle0', timeout: 30000 });
        try {
            await page.waitForSelector('p-table tbody tr', { timeout: 15000 });
            const count = await page.evaluate(() => document.querySelectorAll('p-table tbody tr').length);
            const sample = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('p-table tbody tr')).slice(0, 3);
                return rows.map(tr => tr.querySelectorAll('td')[1]?.innerText?.trim());
            });
            console.log(`Stats: ${count} rows. Sample names: ${sample.join(', ')}`);
        } catch (e) {
            console.log('Stats: Error loading -', e.message.split('\n')[0]);
        }

        // Bilanz page
        await page.goto(`${base}/statistics/player/results`, { waitUntil: 'networkidle0', timeout: 30000 });
        try {
            await page.waitForSelector('p-table tbody tr', { timeout: 15000 });
            const bilanz = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('p-table tbody tr')).slice(0, 3).map(tr => {
                    const tds = tr.querySelectorAll('td');
                    return `${tds[1]?.innerText?.trim()} → ${tds[2]?.innerText?.trim()}`;
                });
            });
            console.log('Bilanz sample:', bilanz);
        } catch (e) {
            console.log('Bilanz: Error loading -', e.message.split('\n')[0]);
        }
    }

    await browser.close();
})();
