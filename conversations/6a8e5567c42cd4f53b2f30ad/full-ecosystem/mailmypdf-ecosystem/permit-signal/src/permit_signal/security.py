import ipaddress
import socket
from urllib.parse import urlparse


class UnsafeTargetError(ValueError):
    pass


def validate_public_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise UnsafeTargetError("Only HTTP and HTTPS URLs are allowed.")
    if not parsed.hostname:
        raise UnsafeTargetError("URL must include a hostname.")

    hostname = parsed.hostname.lower()
    if hostname in {"localhost", "localhost.localdomain"} or hostname.endswith(".local"):
        raise UnsafeTargetError("Local network targets are not allowed.")

    try:
        addresses = {
            item[4][0]
            for item in socket.getaddrinfo(hostname, parsed.port or 443, type=socket.SOCK_STREAM)
        }
    except socket.gaierror as exc:
        raise UnsafeTargetError(f"Hostname could not be resolved: {hostname}") from exc

    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise UnsafeTargetError(f"Non-public network target is not allowed: {address}")

    return url
