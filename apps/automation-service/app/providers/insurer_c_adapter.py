from playwright.async_api import Page
from app.providers.base_provider_adapter import BaseProviderAdapter
from app.schemas.automation_job_schema import QuoteRequest, QuoteResult
from app.core.config import settings


class InsurerCAdapter(BaseProviderAdapter):
    code = "insurer_c"
    name = "TATA AIG Auto Protect (Mock)"
    base_url = settings.INSURER_C_URL

    async def fill_and_submit(self, page: Page, request: QuoteRequest) -> QuoteResult:
        frames = []
        await self.navigate_to_quote(page)
        frames.append(await self.capture_frame(page, "Opened TATA AIG Auto Portal"))

        await page.fill("input[name='customer_name']", request.customer_name)
        await page.fill("input[name='vehicle_registration']", request.vehicle_registration)
        await page.select_option("select[name='product_id']", str(request.product_id))
        await page.fill("input[name='idv']", str(request.idv))
        await page.fill("input[name='vehicle_age_years']", str(request.vehicle_age_years))
        await page.fill("input[name='ncb_percent']", str(request.ncb_percent))

        frames.append(await self.capture_frame(page, "Populated Vehicle IDV and Depreciation Factors"))

        await page.click("button[type='submit']")
        await page.wait_for_load_state("networkidle")

        frames.append(await self.capture_frame(page, "Extracted Comprehensive Auto Protect Quote"))

        premium = await self.extract_premium_from_result(page)
        breakdown = await self.extract_breakdown(page)

        product_el = page.locator("p:has-text('Product:')")
        product_name = "TATA AIG Auto Secure Plus"
        if await product_el.count() > 0:
            product_name = (await product_el.text_content()).replace("Product:", "").strip()

        return QuoteResult(
            insurer_code=self.code,
            insurer_name=self.name,
            product_name=product_name,
            final_premium=premium,
            breakdown=breakdown,
            selected_addons=[],
            screencast_frames=frames,
        )
