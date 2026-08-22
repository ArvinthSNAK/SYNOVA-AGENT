from abc import ABC, abstractmethod
from playwright.async_api import Page
from app.schemas.automation_job_schema import QuoteRequest, QuoteResult


class BaseProviderAdapter(ABC):
    code: str
    name: str
    base_url: str

    @abstractmethod
    async def fill_and_submit(self, page: Page, request: QuoteRequest) -> QuoteResult:
        pass

    async def navigate_to_quote(self, page: Page):
        await page.goto(f"{self.base_url}/quote", wait_until="networkidle")

    async def extract_premium_from_result(self, page: Page) -> float:
        h2 = await page.locator("h2").first.text_content()
        import re
        match = re.search(r"[\d,]+\.?\d*", h2.replace(",", ""))
        if match:
            return float(match.group())
        return 0.0

    async def extract_breakdown(self, page: Page) -> list[dict]:
        rows = page.locator("table tr")
        count = await rows.count()
        breakdown = []
        for i in range(1, count):
            cells = rows.nth(i).locator("td")
            cell_count = await cells.count()
            if cell_count >= 4:
                breakdown.append({
                    "rule": (await cells.nth(0).text_content()).strip(),
                    "rule_type": (await cells.nth(1).text_content()).strip(),
                    "value": float((await cells.nth(2).text_content()).strip()),
                    "running_total": float((await cells.nth(3).text_content()).strip()),
                })
        return breakdown
