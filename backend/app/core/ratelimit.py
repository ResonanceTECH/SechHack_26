"""Rate limiter: in-memory (MVP) или Redis (когда доступен).

Интерфейс `check(key, *, limit, window_seconds)` и `reset(key)` одинаков
для обоих бэкендов — замена без правок в роутах.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Optional

from app.core.config import get_settings


class RateLimiter:
    """Скользящее окно в памяти процесса."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, *, limit: int, window_seconds: int) -> bool:
        now = time.monotonic()
        window = self._hits[key]
        while window and now - window[0] > window_seconds:
            window.popleft()
        if len(window) >= limit:
            return False
        window.append(now)
        return True

    def reset(self, key: str) -> None:
        self._hits.pop(key, None)


class RedisRateLimiter:
    """Redis-backed rate limiter (скользящее окно через sorted set).

    При недоступности Redis (нет модуля/соединения) автоматически
    деградирует до in-memory `RateLimiter`.
    """

    def __init__(self, redis_url: Optional[str] = None) -> None:
        self._fallback = RateLimiter()
        self._client = None
        url = redis_url or get_settings().redis_url
        try:
            import redis  # type: ignore

            client = redis.from_url(url, decode_responses=True, socket_connect_timeout=1)
            client.ping()
            self._client = client
        except Exception:
            self._client = None

    @property
    def backend(self) -> str:
        return "redis" if self._client is not None else "memory"

    def check(self, key: str, *, limit: int, window_seconds: int) -> bool:
        if self._client is None:
            return self._fallback.check(key, limit=limit, window_seconds=window_seconds)
        try:
            now = time.time()
            pipe = self._client.pipeline()
            zkey = f"rl:{key}"
            pipe.zremrangebyscore(zkey, 0, now - window_seconds)
            pipe.zcard(zkey)
            pipe.zadd(zkey, {str(now): now})
            pipe.expire(zkey, window_seconds + 1)
            results = pipe.execute()
            count_before = results[1]
            if count_before >= limit:
                self._client.zrem(zkey, str(now))
                return False
            return True
        except Exception:
            return self._fallback.check(key, limit=limit, window_seconds=window_seconds)

    def reset(self, key: str) -> None:
        if self._client is None:
            self._fallback.reset(key)
            return
        try:
            self._client.delete(f"rl:{key}")
        except Exception:
            self._fallback.reset(key)


limiter = RedisRateLimiter()
