"""This file defines the logic to classify the category and subcategory from the title."""

from src.services.ai.components import (
    PineconeServiceAsync,
    PineconeServiceSync,
    init_pinecone_db_async,
    init_pinecone_db_sync,
)

from src.services.ai.models import VDBClassificationResponse, RelevantNewsTitlesResponse
from src.services._constants import (
    PINECONE_APPLICATION_CATEGORY_NAMESPACE,
    PINECONE_USER_CATEGORY_NAMESPACE,
)


class VDBCategoryClassifierSync:

    def __init__(self, pinecone: PineconeServiceSync = None):
        self._pinecone = pinecone

    @classmethod
    def create(cls):
        return cls(pinecone=init_pinecone_db_sync())

    def close_pc_connection(self) -> None:
        self._pinecone.close()

    def run(
        self, title: str, score_threshold: float = 0.3
    ) -> VDBClassificationResponse:
        related_titles: list[RelevantNewsTitlesResponse] = (
            self._pinecone.get_relevant_news_titles(title=title, k=11)
        )

        subcat_freq = {}
        for record in related_titles:
            if not record._score >= score_threshold:
                continue
            if record.fields.subcategory_id in subcat_freq:
                subcat_freq[record.fields.subcategory_id] += 1
            else:
                subcat_freq[record.fields.subcategory_id] = 1

        return VDBClassificationResponse(
            category_id=None, subcategory_id=max(subcat_freq, key=subcat_freq.get)
        )


class VDBCategoryClassifierAsync:

    def __init__(self, pinecone: PineconeServiceAsync = None):
        self._pinecone = pinecone

    @classmethod
    async def create(cls):
        return cls(pinecone=await init_pinecone_db_async())

    async def close_pc_connection(self) -> None:
        await self._pinecone.close()

    async def run(self, title: str) -> VDBClassificationResponse:
        response = {
            "app_defined": dict(),
            "user_defined": list(),
        }

        app_records: list[RelevantNewsTitlesResponse] = (
            await self._pinecone.get_relevant_title_records(
                namespace=PINECONE_APPLICATION_CATEGORY_NAMESPACE, title=title, k=1
            )
        )
        user_records: list[RelevantNewsTitlesResponse] = (
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
            for record in user_records
            if record["_score"] > app_record_score
        ]

        if len(response) == 0:
            response["user_defined"] = None

        return response


if __name__ == "__main__":

    async def main():
        classifier = await VDBCategoryClassifierSync.create()
        response: VDBClassificationResponse = await classifier.run(
            title="OpenAI Is Taking On Apple’s App Store. It’s Got a Long Way to Go."
        )
        print(f"Classification Response : {response}")

    import asyncio

    asyncio.run(main())
