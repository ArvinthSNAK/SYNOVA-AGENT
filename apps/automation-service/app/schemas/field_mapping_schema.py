from pydantic import BaseModel


class FieldMapping(BaseModel):
    field_name: str
    selector: str
    field_type: str = "input"
    value_source: str = ""


class InsurerConfig(BaseModel):
    code: str
    name: str
    base_url: str
    quote_path: str = "/quote"
    field_mappings: list[FieldMapping] = []
    submit_selector: str = "button[type='submit']"
    result_premium_selector: str = "h2"
    result_breakdown_row_selector: str = "table tr"
    extra_fields: list[str] = []
