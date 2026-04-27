import asyncio
from src.core.ai.pipeline._initialize_pinecone import run_init_pinecone_pipeline
from src.core.ai.components import init_pinecone_db_async


async def main():
    pinecone = await init_pinecone_db_async()
    run_init_pinecone_pipeline(pinecone_client=pinecone)


if __name__ == "__main__":
    asyncio.run(main())
