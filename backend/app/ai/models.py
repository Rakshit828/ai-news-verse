from typing import TypedDict


class TitleCategoryRecord(TypedDict):
    id: str
    title: str
    category: str
    subcategory: str


class TitleRecordFields(TypedDict):
    title: str
    category: str
    subcategory: str


class TitleRecordResponse(TypedDict):
    _id: str
    _score: float
    fields: TitleRecordFields