import requests

host = "http://127.0.0.1:49213"

def make_request(endpoint, payload):
    url = f"{host}{endpoint}"
    response = requests.post(url, json=payload)
    return response.json()
