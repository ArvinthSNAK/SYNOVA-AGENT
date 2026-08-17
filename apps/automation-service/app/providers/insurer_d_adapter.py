from playwright.async_api import Page
from app.providers.base_provider_adapter import BaseProviderAdapter
from app.schemas.automation_job_schema import QuoteRequest, QuoteResult
from app.core.config import settings


class InsurerDAdapter(BaseProviderAdapter):
    code = "insurer_d"
    name = "SafeGuard Motors"
    base_url = settings.INSURER_D_URL

    async def fill_and_submit(self, page: Page, request: QuoteRequest) -> QuoteResult:
        await self.navigate_to_quote(page)

        await page.fill("input[name='customer_name']", request.customer_name)
        await page.fill("input[name='vehicle_registration']", request.vehicle_registration)
        await page.select_option("select[name='product_id']", str(request.product_id))
        await page.fill("input[name='idv']", str(request.idv))
        await page.fill("input[name='vehicle_age_years']", str(request.vehicle_age_years))
        await page.fill("input[name='ncb_percent']", str(request.ncb_percent))
        await page.fill("input[name='engine_capacity_cc']", str(request.engine_capacity_cc))
        await page.select_option("select[name='has_anti_theft']", str(request.has_anti_theft))

        await page.click("button[type='submit']")
        await page.wait_for_load_state("networkidle")

        premium = await self.extract_premium_from_result(page)
        breakdown = await self.extract_breakdown(page)

        product_el = page.locator("p:has-text('Product:')")
        product_name = (await product_el.text_content()).replace("Product:", "").strip()

        return QuoteResult(
            insurer_code=self.code,
            insurer_name=self.name,
            product_name=product_name,
            final_premium=premium,
            breakdown=breakdown,
            selected_addons=[],
        )
