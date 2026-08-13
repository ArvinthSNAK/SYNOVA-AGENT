from fastapi import HTTPException


class ChatController:

    async def chat(self, message: str):
        return {
            "success": True,
            "message": message,
            "response": "Chat controller is working!"
        }