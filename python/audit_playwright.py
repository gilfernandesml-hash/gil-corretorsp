import asyncio
import json
import sys
from typing import Any

from playwright.async_api import async_playwright


async def audit(urls: list[str], timeout_ms: int = 30000) -> dict[str, Any]:
    results: list[dict[str, Any]] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        for url in urls:
            item: dict[str, Any] = {"url": url}
            try:
                resp = await page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
                item["status"] = resp.status if resp else None
                item["title"] = await page.title()

                robots = await page.locator('meta[name="robots"]').get_attribute("content")
                item["robots"] = robots

                canon = await page.locator('link[rel="canonical"]').get_attribute("href")
                item["canonical"] = canon

            except Exception as e:
                item["error"] = str(e)

            results.append(item)

        await context.close()
        await browser.close()

    return {"count": len(results), "results": results}


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python audit_playwright.py <url1> <url2> ...", file=sys.stderr)
        return 2

    report = asyncio.run(audit(sys.argv[1:]))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
