"""This file defines the logic to classify the category and subcategory from the title."""

from app.core.ai.components import PineconeService, init_pinecone_db

from app.core.ai.models import (
    PrimaryCategoryRecordResponse,
    ClassificationResponse,
)
from app.constants import (
    PINECONE_APPLICATION_CATEGORY_NAMESPACE,
    PINECONE_USER_CATEGORY_NAMESPACE,
)


class VDBCategoryClassifier:

    def __init__(self, pinecone: PineconeService = None):
        self._pinecone = pinecone

    @classmethod
    async def create(cls):
        return cls(pinecone=await init_pinecone_db())
    
    async def close_pc_connection(self) -> None:
        await self._pinecone.close()


    async def run(self, title: str) -> ClassificationResponse:
        response = {
            "app_defined": dict(),
            "user_defined": list(),
        }

        app_records: list[PrimaryCategoryRecordResponse] = (
            await self._pinecone.get_relevant_title_records(
                namespace=PINECONE_APPLICATION_CATEGORY_NAMESPACE, title=title, k=1
            )
        )
        user_records: list[PrimaryCategoryRecordResponse] = (
            await self._pinecone.get_relevant_title_records(
                namespace=PINECONE_USER_CATEGORY_NAMESPACE, title=title, k=4
            )
        )

        app_record_score = app_records[0]["_score"]

        response["app_defined"] = {
            "category_id": app_records[0]["fields"]["category_id"],
            "subcategory_id": app_records[0]["fields"]["subcategory_id"],
        }
        response["user_defined"] = [
            {
                "category_id": record["fields"]["category_id"],
                "subcategory_id": record["fields"]["subcategory_id"],
            }
            for record in user_records if record["_score"] > app_record_score
        ]
        
        if len(response) == 0:
            response["user_defined"] = None

        return response



if __name__ == "__main__":

    async def main():
        classifier = await VDBCategoryClassifier.create()
        response: ClassificationResponse = await classifier.run(
            title="OpenAI Is Taking On Apple’s App Store. It’s Got a Long Way to Go."
        )
        print(f"Classification Response : {response}")

    import asyncio

    asyncio.run(main())
