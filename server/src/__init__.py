import os
import sys

if sys.platform.startswith("win32"):
    import tzdata
    os.environ["PYTHONTZPATH"] = os.path.join(
        os.path.dirname(tzdata.__file__), "zoneinfo")
