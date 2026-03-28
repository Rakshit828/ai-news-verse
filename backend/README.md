# 🔧 AI NewsVerse - Backend

The core API and background processing engine for AI NewsVerse, powered by FastAPI, Celery, and various AI integrations.

## 📡 Tech Stack
- **FastAPI:** Modern, high-performance web framework for building APIs with Python 3.12+.
- **SQLAlchemy & Alembic:** Robust ORM and migration management for PostgreSQL.
- **Celery & Redis:** Enterprise-grade task queue for background processing (news fetching & AI classification).
- **Pinecone:** Serverless vector database for semantic similarity and article classification.
- **Groq/Anthropic/OpenAI:** Powering the intelligent summarization and topic validation.

## 🛠️ Components
- **API (v1):** Structured endpoints for authentication, news management, and system monitoring.
- **AI Core:** Specialized services for:
    - `PineconeServiceAsync`: Handles vector embeddings and semantic search.
    - `TopicDescriptionGenerator`: LLM-based service for topic validtion and description generation.
- **Worker:** Celery workers for periodic RSS feed ingestion and batch processing of articles.

## 🚀 Setup & Installation
1. Install dependencies:
   ```bash
   uv sync  # Recommended
   # OR
   pip install -r requirements.txt
   ```
2. Configure `.env`:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `REDIS_URL`: Redis connection string.
   - `PINECONE_API_KEY`: API key for Pinecone.
   - `GROQ_API_KEY`: API key for Groq Cloud.
3. Database Migrations:
   ```bash
   alembic upgrade head
   ```
4. Run the Dev Server:
   ```bash
   python src/runner.py
   ```
5. Run Workers:
   - Celery Worker: `celery -A src.worker.celery_app worker --loglevel=info`
   - Celery Beat (Scheduler): `celery -A src.worker.celery_app beat --loglevel=info`
