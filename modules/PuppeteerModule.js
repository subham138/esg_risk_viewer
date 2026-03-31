const puppeteer = require("puppeteer-core");

let browserInstance = null;
let isLaunching = false;
let requestCount = 0;

async function getBrowser() {
    if (browserInstance) return browserInstance;

    if (isLaunching) {
        // wait if already launching
        await new Promise(resolve => setTimeout(resolve, 500));
        return getBrowser();
    }

    try {
        isLaunching = true;

        browserInstance = await puppeteer.launch({
            headless: true,
            executablePath: process.env.CHROME_EXE_PATH,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--disable-extensions",
                "--disable-background-networking",
                "--disable-sync",
                "--metrics-recording-only",
                "--mute-audio",
                "--no-first-run",
                "--no-default-browser-check"
            ]
        });

        console.log("✅ Puppeteer browser launched");

        browserInstance.on("disconnected", () => {
            console.log("⚠️ Browser disconnected. Resetting...");
            browserInstance = null;
        });

        return browserInstance;

    } finally {
        isLaunching = false;
    }
}

async function createPage() {
    const browser = await getBrowser();
    return await browser.newPage();
}

async function closePage(page) {
    if (page && !page.isClosed()) {
        await page.close();
    }
}

async function restartBrowserIfNeeded() {
    requestCount++;

    if (requestCount >= 50) {
        console.log("♻️ Restarting browser after 50 requests");

        if (browserInstance) {
            try {
                await browserInstance.close();
            } catch (e) { }
        }

        browserInstance = null;
        requestCount = 0;
    }
}

module.exports = {
    createPage,
    closePage,
    restartBrowserIfNeeded
};