const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

const TARGET_URL = "https://www.heartecho.in";
const SUB_PAGES = [
    "/signup",
    "/login",
    "/terms",
    "/refund",
    "/shipping",
    "/privacy",
    "/products",
    "/contact"
];

// State variables
let visitorCount = 0;
let isRunning = false;
let currentProgress = { current: 0, total: 0 };
let logs = [];

async function visitWebsite() {
    const browser = await puppeteer.launch({
        executablePath: '/opt/render/.cache/puppeteer/chrome/linux-134.0.6998.35/chrome-linux64/chrome',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    const page = await browser.newPage();

    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/15.3.1 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0",
        "Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.88 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:90.0) Gecko/20100101 Firefox/90.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:78.0) Gecko/20100101 Firefox/78.0",
        "Mozilla/5.0 (Linux; Android 9; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0",
        "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.98 Mobile Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
        "Mozilla/5.0 (iPad; CPU OS 15_5 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/100.0.1185.39",
        "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.61 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 8.1.0; SM-J710F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; SM-G988U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.62 Mobile Safari/537.36",
        "Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.7.1 Mobile/15E148 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
        "Mozilla/5.0 (Linux; Android 9; Mi A2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.88 Mobile Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36"
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    console.log(`[+] Visiting: ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.evaluate(() => {
        window.scrollBy(0, Math.floor(Math.random() * 500 + 500));
    });
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    const numSubPages = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numSubPages; i++) {
        const randomSubPage = SUB_PAGES[Math.floor(Math.random() * SUB_PAGES.length)];
        const subPageUrl = `${TARGET_URL}${randomSubPage}`;
        console.log(`[+] Navigating to subpage: ${subPageUrl}`);

        try {
            await page.goto(subPageUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
            await page.evaluate(() => {
                window.scrollBy(0, Math.floor(Math.random() * 1000 + 500));
            });
            const waitTime = Math.floor(Math.random() * 7000 + 3000);
            console.log(`[+] Waiting on ${randomSubPage} for ${(waitTime / 1000).toFixed(2)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));

            if (Math.random() < 0.3) {
                console.log(`[+] Going back to: ${TARGET_URL}`);
                await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
                await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
            }
        } catch (error) {
            console.log(`⚠️ Error visiting ${subPageUrl}: ${error.message}`);
        }
    }

    const finalWaitTime = Math.floor(Math.random() * 10000 + 5000);
    console.log(`[+] Final wait for ${(finalWaitTime / 1000).toFixed(2)} seconds...`);
    await new Promise(resolve => setTimeout(resolve, finalWaitTime));

    await browser.close();
    console.log(`[+] Done! Closed browser.`);
    visitorCount++;
}

async function runTraffic(visits) {
    if (isRunning) {
        return 'Traffic generation already in progress';
    }
    isRunning = true;
    currentProgress = { current: 0, total: visits };
    for (let i = 0; i < visits; i++) {
        currentProgress.current = i + 1;
        console.log(`\n🚀 Running visit ${currentProgress.current} of ${visits}`);
        await visitWebsite();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 30000 + 10000)); // 10-40s delay
    }
    isRunning = false;
    currentProgress = { current: 0, total: 0 };
    const timestamp = new Date().toISOString();
    logs.push(`${visits} visits completed at ${timestamp}`);
    if (logs.length > 10) logs.shift();
    return `Completed ${visits} visits`;
}

// Root endpoint with enhanced UI and auto-refresh
app.get('/', (req, res) => {
    const progressPercentage = isRunning ? (currentProgress.current / currentProgress.total) * 100 : 0;
    res.send(`
        <html>
            <head>
                <title>Puppeteer Traffic Generator</title>
                ${isRunning ? '<meta http-equiv="refresh" content="5">' : ''} <!-- Auto-refresh every 5s when running -->
                <style>
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #e0eafc, #cfdef3);
                        color: #2c3e50;
                    }
                    .container {
                        max-width: 900px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    }
                    h1 {
                        text-align: center;
                        color: #34495e;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 18px;
                        margin: 10px 0;
                    }
                    .status {
                        font-weight: bold;
                        color: ${isRunning ? '#e74c3c' : '#27ae60'};
                    }
                    .progress-bar {
                        width: 100%;
                        background: #ecf0f1;
                        border-radius: 5px;
                        height: 25px;
                        margin: 15px 0;
                        overflow: hidden;
                        position: relative;
                    }
                    .progress {
                        width: ${progressPercentage}%;
                        height: 100%;
                        background: #3498db;
                        transition: width 0.5s ease;
                    }
                    .progress-text {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: ${progressPercentage > 50 ? 'white' : '#2c3e50'};
                        font-weight: bold;
                    }
                    .spinner {
                        display: ${isRunning ? 'inline-block' : 'none'};
                        width: 20px;
                        height: 20px;
                        border: 3px solid #ddd;
                        border-top: 3px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        vertical-align: middle;
                        margin-left: 10px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 25px;
                        margin: 5px;
                        background: #3498db;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        transition: background 0.3s, transform 0.2s;
                    }
                    .button:hover {
                        background: #2980b9;
                        transform: translateY(-2px);
                    }
                    .button:active {
                        transform: translateY(0);
                    }
                    .reset-button {
                        background: #e74c3c;
                    }
                    .reset-button:hover {
                        background: #c0392b;
                    }
                    .log {
                        background: #f9f9f9;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                        max-height: 200px;
                        overflow-y: auto;
                    }
                    .log p {
                        margin: 5px 0;
                        font-size: 14px;
                        color: #7f8c8d;
                    }
                    form {
                        margin: 10px 0;
                    }
                    input[type="number"] {
                        padding: 10px;
                        width: 100px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 16px;
                    }
                    input[type="submit"] {
                        padding: 10px 20px;
                        background: #3498db;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background 0.3s;
                    }
                    input[type="submit"]:hover {
                        background: #2980b9;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Puppeteer Traffic Generator</h1>
                    <p>Total Visitors: <strong>${visitorCount}</strong></p>
                    <p>Status: <span class="status">${isRunning ? 'Running' : 'Idle'}</span><span class="spinner"></span></p>
                    ${isRunning ? `
                        <div class="progress-bar">
                            <div class="progress"></div>
                            <span class="progress-text">${currentProgress.current} / ${currentProgress.total} (${Math.round(progressPercentage)}%)</span>
                        </div>
                    ` : ''}
                    <p>Actions:</p>
                    <a href="/add50" class="button">Add 50 Visits</a>
                    <a href="/add100" class="button">Add 100 Visits</a>
                    <a href="/reset" class="button reset-button">Reset Count</a>
                    <p>Custom Visits:</p>
                    <form action="/add" method="get">
                        <input type="number" name="count" min="1" placeholder="Enter count" required>
                        <input type="submit" value="Add Visits">
                    </form>
                    <div class="log">
                        <h3>Recent Logs</h3>
                        ${logs.length ? logs.map(log => `<p>${log}</p>`).join('') : '<p>No logs yet</p>'}
                    </div>
                </div>
            </body>
        </html>
    `);
});

// Endpoint for 50 visits
app.get('/add50', async (req, res) => {
    const result = await runTraffic(50);
    res.send(`<p>${result}</p><p><a href="/">Back to status</a></p>`);
});

// Endpoint for 100 visits
app.get('/add100', async (req, res) => {
    const result = await runTraffic(100);
    res.send(`<p>${result}</p><p><a href="/">Back to status</a></p>`);
});

// Endpoint to reset visitor count
app.get('/reset', (req, res) => {
    if (!isRunning) {
        visitorCount = 0;
        logs.push(`Visitor count reset at ${new Date().toISOString()}`);
        if (logs.length > 10) logs.shift();
        res.send(`<p>Visitor count reset to 0</p><p><a href="/">Back to status</a></p>`);
    } else {
        res.send(`<p>Cannot reset while running</p><p><a href="/">Back to status</a></p>`);
    }
});

// Endpoint for custom visit count
app.get('/add', async (req, res) => {
    const count = parseInt(req.query.count, 10);
    if (isNaN(count) || count <= 0) {
        res.send(`<p>Invalid visit count. Please enter a positive number.</p><p><a href="/">Back to status</a></p>`);
    } else {
        const result = await runTraffic(count);
        res.send(`<p>${result}</p><p><a href="/">Back to status</a></p>`);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
