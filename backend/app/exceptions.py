from fastapi import status
from app.response import ErrorResponse, T

class UnexpectedErrorInController(ErrorResponse[T]):
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    message: str = "Something went wrong."
    error: str = "unexpected_error_in_controller"
    data: T | None = None

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


class NotMeaningfulTopicError(ErrorResponse[T]):
    status_code: int = status.HTTP_400_BAD_REQUEST
    message: str = "The category or subcategory is not meaningful or related to AI."
    error: str = "not_meaningful_topic_error"
    data: T | None = None