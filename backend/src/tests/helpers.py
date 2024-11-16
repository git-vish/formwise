import json
from pathlib import Path


def load_json_data(file_name: str) -> dict:
    """Loads test JSON data from a file.

    Args:
        file_name (str): The name of the JSON file to load.

    Returns:
        dict: The loaded JSON data.
    """
    base_dir = Path(__file__).parent
    data_dir = base_dir / "json"
    file_path = data_dir / file_name
    with file_path.open(encoding="utf-8") as f:
        return json.load(f)
