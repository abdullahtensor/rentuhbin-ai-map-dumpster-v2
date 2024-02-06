"""Script to obtain the full path of the '../data' directory.
Usage:
    - Ensure the src.utils module is available.
    - Run the script to get the full path of the '../data' directory.

Note: Adjust the script or import statements as needed for your specific use case.
"""
from src.utils import get_full_path  # type: ignore

if __name__ == "__main__":
    p = get_full_path("../data")
    print(p)
