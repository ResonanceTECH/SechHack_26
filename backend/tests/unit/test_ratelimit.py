"""Rate limiter: скользящее окно (AUTH_PLAN.md §8)."""

from app.core.ratelimit import RateLimiter


class TestRateLimiter:
    def test_allows_up_to_limit(self) -> None:
        rl = RateLimiter()
        for _ in range(5):
            assert rl.check("k", limit=5, window_seconds=60) is True

    def test_blocks_over_limit(self) -> None:
        rl = RateLimiter()
        for _ in range(5):
            rl.check("k", limit=5, window_seconds=60)
        assert rl.check("k", limit=5, window_seconds=60) is False

    def test_keys_are_isolated(self) -> None:
        rl = RateLimiter()
        for _ in range(5):
            rl.check("a", limit=5, window_seconds=60)
        assert rl.check("a", limit=5, window_seconds=60) is False
        assert rl.check("b", limit=5, window_seconds=60) is True

    def test_reset_clears_counter(self) -> None:
        rl = RateLimiter()
        for _ in range(5):
            rl.check("k", limit=5, window_seconds=60)
        rl.reset("k")
        assert rl.check("k", limit=5, window_seconds=60) is True
