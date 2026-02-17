FROM python:3.12-slim-trixie

COPY --from=ghcr.io/astral-sh/uv:0.10.3 /uv /uvx /bin/

WORKDIR /contenerization

COPY uv.lock pyproject.toml ./
RUN uv sync --locked

COPY . .


CMD ["uv", "run", "fastapi", "dev", "app"]
