    cursor.execute(statement, parameters)

  File "/contenerization/.venv/lib/python3.12/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 585, in execute

    self._adapt_connection.await_(

  File "/contenerization/.venv/lib/python3.12/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 132, in await_only

    return current.parent.switch(awaitable)  # type: ignore[no-any-return,attr-defined] # noqa: E501

           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  File "/contenerization/.venv/lib/python3.12/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 196, in greenlet_spawn

    value = await result

            ^^^^^^^^^^^^

  File "/contenerization/.venv/lib/python3.12/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 520, in _prepare_and_execute

    await adapt_connection._start_transaction()

  File "/contenerization/.venv/lib/python3.12/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 850, in _start_transaction

    self._handle_exception(error)

  File "/contenerization/.venv/lib/python3.12/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 799, in _handle_exception

    raise error

  File "/contenerization/.venv/lib/python3.12/site-packages/sqlalchemy/dialects/postgresql/asyncpg.py", line 848, in _start_transaction

    await self._transaction.start()

  File "/contenerization/.venv/lib/python3.12/site-packages/asyncpg/transaction.py", line 146, in start

    await self._connection.execute(query)

  File "/contenerization/.venv/lib/python3.12/site-packages/asyncpg/connection.py", line 354, in execute

    result = await self._protocol.query(query, timeout)

             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  File "asyncpg/protocol/protocol.pyx", line 369, in query

RuntimeError: Task <Task pending name='Task-71' coro=<run_fetch() running at /contenerization/app/background_tasks/tasks.py:9> cb=[_run_until_complete_cb() at /usr/local/lib/python3.12/asyncio/base_events.py:181]> got Future <Future pending cb=[BaseProtocol._on_waiter_completed()]> attached to a different loop
