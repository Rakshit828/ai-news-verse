import asyncio
from contextvars import ContextVar

var = 5

async def task(name, value):
    global var
    var = value
    await asyncio.sleep(1)
    print(f"{name}: {var}")

async def main():
    await asyncio.gather(
        task("A", 1),
        task("B", 2)
    )
    print(var)


asyncio.run(main())