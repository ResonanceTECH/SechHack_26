"""In-memory rate limiter (скользящее окно).

MVP: Redis-бэкенд подключим вместе с Celery (TASKS.md этап 6/8); пока
достаточно процессного лимитера с тем же интерфейсом — замена без правок
в роутах.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque


class RateLimiter:
    """Скользящее окно: limit попыток за window_seconds на ключ."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str, *, limit: int, window_seconds: int) -> bool:
        """True, если запрос разрешён (и фиксирует попытку). False → 429."""
        now = time.monotonic()
        window = self._hits[key]
        while window and now - window[0] > window_seconds:
            window.popleft()
        if len(window) >= limit:
            return False
        window.append(now)
        return True

    def reset(self, key: str) -> None:
        """Очистить счётчик (например, после успешного входа)."""
        self._hits.pop(key, None)


# Глобальный экземпляр — один на процесс
limiter = RateLimiter()
