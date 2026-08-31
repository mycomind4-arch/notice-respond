import pytest

from permit_signal.security import UnsafeTargetError, validate_public_url


@pytest.mark.parametrize(
    "url",
    [
        "file:///etc/passwd",
        "http://localhost:8000",
        "http://127.0.0.1/private",
        "http://10.0.0.5/internal",
    ],
)
def test_rejects_non_public_targets(url: str) -> None:
    with pytest.raises(UnsafeTargetError):
        validate_public_url(url)
