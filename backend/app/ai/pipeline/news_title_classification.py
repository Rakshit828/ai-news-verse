"""This file defines the logic to classify the category and subcategory from the title."""

from app.ai.components.pinecone_db import PineconeClient, init_pinecone_db
from app.ai.models import (
    PrimaryCategoryRecordResponse,
    ClassificationResponse,
)
from app.constants import (
    PINECONE_APPLICATION_CATEGORY_NAMESPACE,
    PINECONE_USER_CATEGORY_NAMESPACE,
)


class VDBCategoryClassifier:

    def __init__(self, pinecone: PineconeClient = None):
        self.pinecone = pinecone

    @classmethod
    async def create(cls):
        return cls(pinecone=await init_pinecone_db())


    async def run(self, title: str) -> ClassificationResponse:
        response = {
            "app-defined": [],
            "user-defined": [],
        }

        app_records: list[PrimaryCategoryRecordResponse] = (
            await self.pinecone.get_relevant_title_records(
                namespace=PINECONE_APPLICATION_CATEGORY_NAMESPACE, title=title, k=1
            )
        )
        user_records: list[PrimaryCategoryRecordResponse] = (
            await self.pinecone.get_relevant_title_records(
                namespace=PINECONE_USER_CATEGORY_NAMESPACE, title=title, k=4
            )
        )

        app_record_score = app_records[0]["_score"]

        response["app-defined"] = {
            "category_id": app_records[0]["fields"]["category_id"],
            "subcategory_id": app_records[0]["fields"]["subcategory_id"],
        }
        response["user-defined"] = [
            {
                "category_id": record["fields"]["category_id"],
                "subcategory_id": record["fields"]["subcategory_id"],
            }
            for record in user_records if record["_score"] > app_record_score
        ]

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
