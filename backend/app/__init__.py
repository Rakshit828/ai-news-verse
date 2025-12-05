from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.response import AppError
from app.routes import auth_routes, news_routes
from app.log import logger

VERSION = "v1"
origins = [
    "http://localhost:5173",
]


app = FastAPI(title="AiNewsVerse", version=VERSION)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # can be ["*"] to allow all origins
    allow_credentials=True,  # allow cookies, authorization headers
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc
    allow_headers=["*"],  # Allow all headers
)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    logger.error(
        f"Error occurred: {exc.error_response.error}, "
        f"Message: {exc.error_response.message}, "
        f"Status: {exc.error_response.status_code}, "
        f"Path: {request.url.path}"
    )
    return JSONResponse(
        status_code=exc.error_response.status_code,  # This status code is of the JSONResponse itself
        content=exc.error_response.model_dump(),  # Our response resides here
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Convert Pydantic errors into your structure
    error_msg = ""
    missing_fields = ""
    for error in exc.errors():
        if error["type"] == "missing":
            missing_fields = missing_fields + error["loc"][1] + ", "
        elif error["type"] == "json_invalid":
            error_msg = "Invalid Json Structure."

    if missing_fields:
        error_msg = f"Missing {missing_fields}"

    logger.error(
        f"Error occurred: {[error['type'] for error in exc.errors()]}, "
        f"Message: {error_msg if error_msg else exc.errors()}, "
        f"Status: {400}, "
        f"Path: {request.url.path}"
    )

    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "status_code": 400,
            "error": "validation_error",
            "message": error_msg,
        },
    )


app.include_router(news_routes, tags=["News"], prefix=f"/api/{VERSION}/news")
app.include_router(auth_routes, tags=["Authentication"], prefix=f"/api/{VERSION}/auth")
