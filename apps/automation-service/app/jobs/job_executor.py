import asyncio
import uuid
from playwright.async_api import async_playwright
from app.providers.provider_registry import get_adapter
from app.schemas.automation_job_schema import QuoteRequest, QuoteResult, AutomationJobResponse
from app.core.config import settings


async def run_single_insurer(insurer_code: str, request: QuoteRequest) -> QuoteResult:
    adapter = get_adapter(insurer_code)
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=settings.PLAYWRIGHT_HEADLESS,
            slow_mo=settings.SLOW_MO_MS
        )
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        try:
            result = await adapter.fill_and_submit(page, request)
            # Give short delay so user can see final quote page visually on screen
            await page.wait_for_timeout(1800)
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

    # Sequential execution ensures each insurer portal opens one-by-one clearly on desktop
    results = []
    for code in insurer_codes:
        res = await run_single_insurer(code, request)
        results.append(res)

    return AutomationJobResponse(
        job_id=job_id,
        status="completed",
        results=results,
    )
