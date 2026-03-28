from fastapi.responses import JSONResponse
from fastapi import APIRouter, status
from loguru import logger

from src.db.main import async_engine
from src.worker.db import sync_engine

monitoring_routes = APIRouter()



@monitoring_routes.get("/db-metrics/celery")
async def get_db_metrics():
    try:
        pool = sync_engine.pool
        
        metrics = {
            "pool_size": pool.size(),
            "checked_in_idle": pool.checkedin(),
            "checked_out_in_use": pool.checkedout(),
            "overflow": pool.overflow()
        }

        # Log the metrics for persistence/monitoring
        logger.info(f"Database metrics retrieved: {metrics}")

        return metrics

    except Exception as e:
        logger.error(f"Failed to retrieve DB metrics: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Could not retrieve database metrics"}
        )


@monitoring_routes.get("/db-metrics")
async def get_db_metrics():
    try:
        pool = async_engine.pool
        
        metrics = {
            "pool_size": pool.size(),
            "checked_in_idle": pool.checkedin(),
            "checked_out_in_use": pool.checkedout(),
            "overflow": pool.overflow()
        }

        # Log the metrics for persistence/monitoring
        logger.info(f"Database metrics retrieved: {metrics}")

        return metrics

    except Exception as e:
        logger.error(f"Failed to retrieve DB metrics: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Could not retrieve database metrics"}
        )

