import json

with open("config.json", "r") as file:
    data = json.load(file)

read_formats = [ext for file in data["read_files"] for ext in file["extensions"] if ext != '*']
write_formats = [ext for file in data["write_files"] for ext in file["extensions"] if ext != '*']