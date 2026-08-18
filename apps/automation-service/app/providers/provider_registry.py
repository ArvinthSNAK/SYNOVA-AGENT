from app.providers.insurer_a_adapter import InsurerAAdapter
from app.providers.insurer_b_adapter import InsurerBAdapter
from app.providers.insurer_c_adapter import InsurerCAdapter
from app.providers.insurer_d_adapter import InsurerDAdapter
from app.providers.base_provider_adapter import BaseProviderAdapter

_REGISTRY: dict[str, BaseProviderAdapter] = {
    "insurer_a": InsurerAAdapter(),
    "insurer_b": InsurerBAdapter(),
    "insurer_c": InsurerCAdapter(),
    "insurer_d": InsurerDAdapter(),
}


def get_adapter(code: str) -> BaseProviderAdapter:
    adapter = _REGISTRY.get(code)
    if adapter is None:
        raise ValueError(f"No adapter registered for insurer code: {code}")
    return adapter


def list_adapters() -> list[str]:
    return list(_REGISTRY.keys())
