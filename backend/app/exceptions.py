from fastapi import status
from app.response import ErrorResponse, T


class CategoryNotFoundError(ErrorResponse[T]):
    status_code: int = status.HTTP_404_NOT_FOUND
    message: str = "Category not found"
    error: str = "category_not_found_error"
    data: T | None = None


class SubCategoryNotFoundError(ErrorResponse[T]):
    status_code: int = status.HTTP_404_NOT_FOUND
    message: str = "Subcategory not found"
    error: str = "subcategory_not_found_error"
    data: T | None = None

class CategoryAlreadyExistsError(ErrorResponse[T]):
    status_code: int = status.HTTP_409_CONFLICT
    message: str = "Category already exists."
    error: str = "category_already_exists_error"
    data: T | None = None

class SubCategoryAlreadyExistsError(ErrorResponse[T]):
    status_code: int = status.HTTP_409_CONFLICT
    message: str = "SubCategory already exists."
    error: str = "subcategory_already_exists_error"
    data: T | None = None