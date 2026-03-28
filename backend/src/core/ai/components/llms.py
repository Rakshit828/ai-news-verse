import groq
import asyncio
import functools
import inspect
from loguru import logger
from typing import Iterable
from src.config import CONFIG
import anyio
import enum


class GroqModelEnum(enum.Enum):
    GPT_OSS_120B = "openai/gpt-oss-120b"
    GPT_OSS_20B = "openai/gpt-oss-20b"
    LLAMA_3_3_70B_VERSATILE = "llama-3.3-70b-versatile"
    KIMI_K2_INSTRUCT_0905 = "moonshotai/kimi-k2-instruct-0905"
    QWEN3_32B = "qwen/qwen3-32b"


def retry_on_groq_rate_limit_async(
    models: Iterable[GroqModelEnum],
    max_retries: int | None = None,
):
    """
    Retries an async function on Groq RateLimitError by switching models.

    Assumptions:
    - The wrapped function is an async method
    - `self.client.chat.completions.create` accepts `model=...`
    - The wrapped function accepts `model` as a keyword argument
    """

    model_list: list[GroqModelEnum] = list(models)
    if not model_list:
        raise ValueError("At least one model must be provided")

    def decorator(func):
        is_async = inspect.iscoroutinefunction(func)
        if not is_async:
            raise TypeError("Works only with async function.")

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            self = args[0]
            first_model_used = kwargs["model"] if kwargs['model'] is not None else self.default_model

            models_to_retry: list[GroqModelEnum] = (
                model_list if max_retries is None else model_list[:max_retries]
            )
            models_to_retry.remove(first_model_used)

            last_exc: Exception | None = None

            try:
                # Tries the user provided model, explicit of default
                return await func(*args, **kwargs)
                
            except groq._exceptions.RateLimitError as exc:

                # Tries all models except the first one used, that caused error
                for i, model in enumerate(models_to_retry):
                    last_exc = exc
                    self.default_model = models_to_retry[i]
                    kwargs["model"] = models_to_retry[i]
                    try:
                        return await func(*args, **kwargs)
                    except groq._exceptions.RateLimitError as exc:
                        last_exc = exc
                        logger.warning(
                            f"Groq rate limit hit for {model}. Retrying with next model: {self.default_model}"
                        )

            # All models exhausted
            logger.error("All Groq models exhausted due to rate limits")
            raise last_exc

        return wrapper

    return decorator



class UseLLMsGroqAsync:

    def __init__(self, default_model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B):
        self._client: groq.AsyncGroq = groq.AsyncGroq(api_key=CONFIG.GROQ_API_KEY)
        self.default_model: GroqModelEnum = default_model


    @retry_on_groq_rate_limit_async(
        models=GroqModelEnum,
        max_retries=5,
    )
    async def chat_completion(
        self,
        prompt: str,
        system_content: str = "You are a helpful AI assistant",
        model: GroqModelEnum | None = None,
        temperature: float = 0.9,
    ) -> str:
        """Returns the chat completion from the groq"""
        if model is not None:
            model = model.value
        else:
            model = self.default_model.value
        
        chat_completion = await self._client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": prompt},
            ],
            model=model,
            temperature=temperature
        )
        return chat_completion.choices[0].message.content


def retry_on_groq_rate_limit_sync(
    models: Iterable[GroqModelEnum],
    max_retries: int | None = None,
):
    """
    Retries a sync function on Groq RateLimitError by switching models.

    Works only with sync methods.
    """

    model_list: list[GroqModelEnum] = list(models)
    if not model_list:
        raise ValueError("At least one model must be provided")

    def decorator(func):
        if inspect.iscoroutinefunction(func):
            raise TypeError("Works only with sync function.")

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            self = args[0]
            first_model_used = kwargs.get("model", self.default_model)

            models_to_retry: list[GroqModelEnum] = (
                model_list if max_retries is None else model_list[:max_retries]
            )
            if first_model_used in models_to_retry:
                models_to_retry.remove(first_model_used)

            last_exc: Exception | None = None

            try:
                # Try user-provided model or default
                return func(*args, **kwargs)

            except groq._exceptions.RateLimitError as exc:
                last_exc = exc
                # Try all other models
                for i, model in enumerate(models_to_retry):
                    self.default_model = model
                    kwargs["model"] = model
                    try:
                        return func(*args, **kwargs)
                    except groq._exceptions.RateLimitError as exc:
                        last_exc = exc
                        logger.warning(
                            f"Groq rate limit hit for {model}. Retrying with next model: {self.default_model}"
                        )

            # All models exhausted
            logger.error("All Groq models exhausted due to rate limits")
            raise last_exc

        return wrapper

    return decorator


class UseLLMsGroqSync:
    def __init__(self, default_model: GroqModelEnum = GroqModelEnum.GPT_OSS_120B):
        self._client: groq.Groq = groq.Groq(api_key=CONFIG.GROQ_API_KEY)
        self.default_model: GroqModelEnum = default_model

    @retry_on_groq_rate_limit_sync(
        models=GroqModelEnum,
        max_retries=5,
    )
    def chat_completion(
        self,
        prompt: str,
        system_content: str = "You are a helpful AI assistant",
        model: GroqModelEnum | None = None,
        temperature: float = 0.9,
    ) -> str:
        """Returns the chat completion from Groq (blocking sync)"""
        if model is not None:
            model_name = model.value
        else:
            model_name = self.default_model.value

        # Sync call
        chat_completion = self._client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": prompt},
            ],
            model=model_name,
            temperature=temperature,
        )

        return chat_completion.choices[0].message.content



if __name__ == "__main__":
    async def main():
        llm = UseLLMsGroqSync()
        result = llm.chat_completion(
            prompt="What is life?", model=GroqModelEnum.KIMI_K2_INSTRUCT_0905
        )
        print("The result is:", result)
    asyncio.run(main=main())



