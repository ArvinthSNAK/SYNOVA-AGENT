from pydantic import BaseModel


class WalletCreate(BaseModel):
    user_id: int
    policy_number: str
    insurer_name: str
    policy_type: str
    premium: float
    status: str = "active"


class WalletResponse(BaseModel):
    id: int
    user_id: int
    policy_number: str
    insurer_name: str
    policy_type: str
    premium: float
    status: str

    class Config:
        from_attributes = True