"""This file defines the logic to classify the category and subcategory from the title."""

from app.ai import TitleRecordResponse
from app.ai.components.pinecone_db import PineconeClient, init_pinecone_db

class TitleClassifier:
    
    def __init__(self, pinecone: PineconeClient = None):
        self.pinecone = pinecone

    @classmethod
    async def create(cls):
        return cls(pinecone=await init_pinecone_db())

    async def _identify_correct_category_subcategory(
        self,
        records: list[TitleRecordResponse],
    ) -> tuple[str, str]:
        
        required_category = None
        category_frequency = {}

        # Step 1: Filter out the records with score less than 0.25
        filtered_records = [record for record in records if record.get('_score', 0) >= 0.2]
        # Step 2: Find the subcategory with most frequency
        for record in filtered_records:
            if record['fields']['subcategory'] in category_frequency:
                category_frequency[record['fields']['subcategory']] += 1
            else:
                category_frequency[record['fields']['subcategory']] = 1

        max_frequency_subcategory = max(category_frequency, key=category_frequency.get)

        # Step 3: Find category acc. to subcategory
        for record in records:
            if record['fields']['subcategory'] == max_frequency_subcategory:
                required_category = record['fields']['category']
                break

        return required_category, max_frequency_subcategory
    

    async def run_pipeline(self, title: str) -> tuple[str, str]:
        records: list[TitleRecordResponse] = await self.pinecone.get_relevant_title_records(title=title)
        return await self._identify_correct_category_subcategory(records)
    


if __name__ == "__main__":
    async def main():
        classifier = await TitleClassifier.create()
        category, subcategory = await classifier.run_pipeline(title="OpenAI Is Taking On Apple’s App Store. It’s Got a Long Way to Go.")
        print(category, subcategory)

    import asyncio
    asyncio.run(main())

