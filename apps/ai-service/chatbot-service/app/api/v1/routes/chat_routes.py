from fastapi import APIRouter
from app.controllers.chat_controller import ChatController

router = APIRouter()

controller = ChatController()


@router.post("/chat")
async def chat(message: str):
    return await controller.chat(message)