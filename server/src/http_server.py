import json
import time
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler


class CustomHTTPServer(ThreadingHTTPServer):
    """
    A custom HTTP server class that accepts an additional endpoint_handler argument.
    """

    def __init__(self, server_address, RequestHandlerClass, endpoint_handler):
        self.handler_instance = endpoint_handler
        super().__init__(server_address, RequestHandlerClass)


class RequestHandler(BaseHTTPRequestHandler):

    def _set_response(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.end_headers()

    def handle_request(self, request_data):
        request_json = json.loads(request_data)
        path = self.path
        endpoint_to_function = self.server.handler_instance.get_endpoints_map()

        if path in endpoint_to_function:
            self._set_response()
            response_data = endpoint_to_function[path](request_json)
        else:
            self._set_response(404)
            response_data = {'error': 'Endpoint not found.'}

        response_json = json.dumps(response_data, default=str)
        self.wfile.write(response_json.encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        request_data = self.rfile.read(content_length).decode('utf-8')
        self.handle_request(request_data)

    def log_message(self, format, *args):
        timestamp = time.strftime('[%Y-%m-%d %H:%M:%S]')
        print(f'{timestamp}', *args, flush=True)
