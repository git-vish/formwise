import secrets
import string

__all__ = ["generate_unique_id"]


def generate_unique_id(length: int = 8, prefix: str = None) -> str:
    """Generates a unique ID using the secrets module.

    Args:
        length (int, optional): The length of the ID. Defaults to 8.
        prefix (str, optional): A prefix to add to the ID. Defaults to None.

    Returns:
        str: The generated unique ID
    """
    charset = string.ascii_letters + string.digits
    random_str = "".join(secrets.choice(charset) for _ in range(length))
    return f"{prefix}-{random_str}" if prefix else random_str
