import requests

host = "http://127.0.0.1:49213"


def make_request(endpoint, payload):
    url = f"{host}{endpoint}"
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as err:
        raise RuntimeError(
            f"Error occurred during request to {url}: {err}") from err
