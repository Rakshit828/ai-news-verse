# 🚀 AI NewsVerse

An news aggregation platform that delivers deeply personalized, curated insights from premium sources.


## 📡 Tech Stack

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous Python)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy](https://www.sqlalchemy.org/) & [Alembic](https://alembic.sqlalchemy.org/)
- **Vector DB:** [Pinecone](https://www.pinecone.io/) for news classification
- **AI/LLM:** [Groq](https://groq.com/)
- **Task Queue:** [Celery](https://docs.celeryq.dev/) with [Redis](https://redis.io/) for periodic news fetching

### Frontend
- **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)

---

## ✨ Key Features

- **🤖 AI-Driven Classification:** News articles are automatically classified into categories and subcategories using semantic vector search (Pinecone).
- **🎭 Personalization:** Users can create custom categories and subcategories. The system validates them using AI to ensure they are meaningful topics.
- **⚡ Real-time Updates:** Stay updated with live news feeds powered by WebSockets and notification systems.
- **📦 Background Processing:** Robust background workers (Celery) periodically fetch news from diverse RSS feeds and process them without affecting application performance.
---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL
- Redis
- Pinecone API Key
- Groq/OpenAI API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   # Or using uv
   uv sync
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your credentials.
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the server:
   ```bash
   python src/runner.py
   ```
6. Start Celery worker:
   ```bash
   celery -A src.worker.celery_app worker --loglevel=info
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file with `VITE_API_URL=http://localhost:8000`.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🏗️ Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── api/          # FastAPI routes
│   │   ├── core/         # AI components, Pinecone, LLM logic, News Scrapers
│   │   ├── db/           # SQLAlchemy models and migrations
│   │   ├── services/     # Business logic (News, Auth, Filters)
│   │   └── worker/       # Celery worker code
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Main application views
│   │   ├── store/        # Zustand state stores
│   │   └── services/     # Axios API clients
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

**Built with ❤️ by [Rakshit Paudyal](https://github.com/Rakshit828)**
