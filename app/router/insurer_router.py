from fastapi import APIRouter

from app.insurer.mock_insurers import mock_insurers
from app.service.insurer_monitor_service import check_for_changes


router = APIRouter(
    prefix="/insurers",
    tags=["Insurers"]
)


@router.get("/")
def get_insurers():
    return mock_insurers


@router.get("/monitor/check")
def monitor_insurers():
    return check_for_changes()


@router.get("/{insurer_id}")
def get_insurer(insurer_id: str):
    insurer = mock_insurers.get(insurer_id)

    if not insurer:
        return {
            "message": "Insurer not found"
        }

    return insurer