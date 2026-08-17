from fastapi import APIRouter
from app.schemas.automation_job_schema import AutomationJobRequest, AutomationJobResponse
from app.jobs.job_executor import run_automation_job
from app.providers.provider_registry import list_adapters

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/insurers")
def get_available_insurers():
    return {"insurers": list_adapters()}


@router.post("/automation/run", response_model=AutomationJobResponse)
async def run_automation(request: AutomationJobRequest):
    response = await run_automation_job(
        insurer_codes=request.insurer_codes,
        quote_request=request.quote_request,
    )
    return response
