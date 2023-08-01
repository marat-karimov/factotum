import json
import os
import sys

if getattr(sys, 'frozen', False):
    exe_path = os.path.dirname(sys.executable)
    config_path = os.path.join(exe_path, 'config.json')
else:
    config_path = "config.json"

with open(config_path, "r") as file:
    data = json.load(file)

read_formats = [ext for file in data["read_files"] for ext in file["extensions"] if ext != '*']
write_formats = [ext for file in data["write_files"] for ext in file["extensions"] if ext != '*']