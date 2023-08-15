import os
import tzdata

os.environ["PYTHONTZPATH"] = os.path.join(
    os.path.dirname(tzdata.__file__), "zoneinfo")
