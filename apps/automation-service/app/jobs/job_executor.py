import asyncio
import uuid
from playwright.async_api import async_playwright
from app.providers.provider_registry import get_adapter
from app.schemas.automation_job_schema import QuoteRequest, QuoteResult, AutomationJobResponse
from app.core.config import settings


async def run_single_insurer(insurer_code: str, request: QuoteRequest) -> QuoteResult:
    adapter = get_adapter(insurer_code)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=settings.PLAYWRIGHT_HEADLESS)
        page = await browser.new_page()
        try:
            result = await adapter.fill_and_submit(page, request)
            return result
        except Exception as e:
            return QuoteResult(
                insurer_code=insurer_code,
                insurer_name=adapter.name,
                product_name="",
                final_premium=0.0,
                breakdown=[],
                selected_addons=[],
                status="error",
                error=str(e),
            )
        finally:
            await browser.close()


async def run_automation_job(insurer_codes: list[str], request: QuoteRequest) -> AutomationJobResponse:
    job_id = str(uuid.uuid4())

    tasks = [run_single_insurer(code, request) for code in insurer_codes]
    results = await asyncio.gather(*tasks, return_exceptions=False)

    return AutomationJobResponse(
        job_id=job_id,
        status="completed",
        results=list(results),
    )
