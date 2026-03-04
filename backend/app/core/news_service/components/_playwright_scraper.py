from playwright.async_api import Playwright, async_playwright
import asyncio

async def run_playwright(playwright: Playwright, url: str):
    chromium = playwright.chromium

    browser = await chromium.launch(
        headless=True,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage",
            "--no-sandbox",
        ],
    )

    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        viewport={"width": 1600, "height": 900},
        locale="en-US",
        color_scheme="light",
        permissions=["geolocation"],
    )

    page = await context.new_page()

    await page.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """)

    await page.add_init_script("""
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US','en']
        });

        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3]
        });

        window.chrome = { runtime: {} };
    """)

    await page.goto(url, wait_until='domcontentloaded')

    await page.wait_for_timeout(timeout=2000)
    
    html = await page.content()

    await browser.close()
    return { "html": html }


if __name__ == '__main__':
    async def main(url: str):
        async with async_playwright() as playwright:
            result = await run_playwright(playwright, url)
            print("THE scraping reslut is : ", result)
            return
    
    asyncio.run(main(url='https://economictimes.indiatimes.com/tech/artificial-intelligence/meet-the-newest-billionaires-of-silicon-valley-founders-of-ai-coding-tool-cursor/articleshow/125569343.cms?from=mdr'))
