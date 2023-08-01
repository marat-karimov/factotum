import json
import os
import threading
import time
import argparse
import psutil
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

from server.processor import DataProcessor
from server.validator import SqlValidator
from server.converter import ReadConverter

from server.duckdb_engine import DuckDBEngine
from server.polars_engine import PolarsEngine
import sys

heartbeat_timeout_sec = 30

last_heartbeat_time = time.time()

processor: DataProcessor = None
converter = ReadConverter()


def kill(data=None):
    response_data = {'message': 'Server is shutting down...'}
    converter.cleanup()
    threading.Timer(1.0, os._exit, args=(0,)).start()
    return response_data


def get_memory_usage():
    pid = psutil.Process()
    memory_info = pid.memory_info()
    memory_usage = memory_info.rss
    memory_usage_mb = int(memory_usage / (1024 * 1024))
    return {'heartbeat': 'pong', 'memory_usage_mb': memory_usage_mb}


def heartbeat(data=None):
    global last_heartbeat_time
    last_heartbeat_time = time.time()

    return get_memory_usage()


def init_engine(engine):

    global processor

    match engine:
        case 'duckdb':
            duckdb_engine = DuckDBEngine(converter)
            validator = SqlValidator(duckdb_engine)
            processor = DataProcessor(duckdb_engine, validator)
        case 'polars':
            polars_engine = PolarsEngine(converter)
            validator = SqlValidator(polars_engine)
            processor = DataProcessor(polars_engine, validator)
        case _:
            raise Exception('Unknown engine')

    endpoint_to_function.update({
        '/import_file': processor.import_file,
        '/run_sql': processor.run_sql,
        '/get_schema': processor.get_schema,
        '/export_file': processor.export_file,
        '/validate': processor.validate,
    })


endpoint_to_function = {
    '/kill': kill,
    '/heartbeat': heartbeat,
}


class RequestHandler(BaseHTTPRequestHandler):
    def _set_response(self, status_code=200, content_type='text/plain'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.end_headers()

    def handle_request(self, request_data):
        request_json = json.loads(request_data)
        path = self.path

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
        super().log_message(f'{timestamp} {format}', *args)


def check_heartbeat():
    global last_heartbeat_time
    while True:
        if time.time() - last_heartbeat_time > heartbeat_timeout_sec:
            print('No heartbeat received. Self-destructing...')
            converter.cleanup()
            os._exit(0)
        time.sleep(1)


def run_server():
    host = '127.0.0.1'
    port = 49213
    server_address = (host, port)

    parser = argparse.ArgumentParser()
    parser.add_argument('engine', type=str, choices=['duckdb', 'polars'])
    args = parser.parse_args()

    engine = args.engine
    init_engine(engine)

    heartbeat_thread = threading.Thread(target=check_heartbeat)
    heartbeat_thread.daemon = True
    heartbeat_thread.start()

    try:
        server = ThreadingHTTPServer(server_address, RequestHandler)
        print(f'Starting Factotum server on http://{host}:{port}', flush=True)
        server.serve_forever()
    except KeyboardInterrupt:
        print('Factotum server stopped.')


if __name__ == '__main__':
    run_server()
