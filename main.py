import os
import threading
import time
import argparse
import psutil
from dataclasses import dataclass

from server.src.http_server import CustomHTTPServer, RequestHandler

from server.src.processor import DataProcessor
from server.src.validator import SqlValidator
from server.src.converter import ReadConverter
from server.src.duckdb_engine import DuckDBEngine
from server.src.polars_engine import PolarsEngine

heartbeat_timeout_sec = 30


@dataclass
class ServerConfig:
    engine: str
    host: str = '127.0.0.1'
    port: int = 49213


class EndpointHandler:
    def __init__(self, engine):
        self.converter = ReadConverter()
        self.init_engine(engine)
        self.last_heartbeat_time = time.time()

    def init_engine(self, engine):
        match engine:
            case 'duckdb':
                duckdb_engine = DuckDBEngine(self.converter)
                validator = SqlValidator(duckdb_engine)
                self.processor = DataProcessor(duckdb_engine, validator)
            case 'polars':
                polars_engine = PolarsEngine(self.converter)
                validator = SqlValidator(polars_engine)
                self.processor = DataProcessor(polars_engine, validator)
            case _:
                raise Exception('Unknown engine')

    def kill(self, data=None):
        response_data = {'message': 'Server is shutting down...'}
        self.converter.cleanup()
        threading.Timer(1.0, os._exit, args=(0,)).start()
        return response_data

    @property
    def memory_usage(self):
        pid = psutil.Process()
        memory_info = pid.memory_info()
        memory_usage = memory_info.rss
        memory_usage_mb = int(memory_usage / (1024 * 1024))
        return {'heartbeat': 'pong', 'memory_usage_mb': memory_usage_mb}

    def heartbeat(self, data=None):
        self.last_heartbeat_time = time.time()
        return self.memory_usage

    def check_heartbeat(self):
        while True:
            if time.time() - self.last_heartbeat_time > heartbeat_timeout_sec:
                print('No heartbeat received. Self-destructing...')
                self.converter.cleanup()
                os._exit(0)
            time.sleep(1)

    def get_endpoints_map(self):
        return {
            '/kill': self.kill,
            '/heartbeat': self.heartbeat,
            '/import_file': self.processor.import_file,
            '/run_sql': self.processor.run_sql,
            '/get_schema': self.processor.get_schema,
            '/export_file': self.processor.export_file,
            '/validate': self.processor.validate,
        }


def run_server(config: ServerConfig):
    server_address = (config.host, config.port)
    endpoint_handler = EndpointHandler(config.engine)

    heartbeat_thread = threading.Thread(
        target=endpoint_handler.check_heartbeat)
    heartbeat_thread.daemon = True
    heartbeat_thread.start()

    try:
        server = CustomHTTPServer(
            server_address, RequestHandler, endpoint_handler)
        print(
            f'Starting Factotum server on http://{config.host}:{config.port}', flush=True)
        server.serve_forever()
    except KeyboardInterrupt:
        print('Factotum server stopped.')


def get_cli_args():
    parser = argparse.ArgumentParser(
        description="Factotum server configuration")
    parser.add_argument('engine', type=str, choices=[
                        'duckdb', 'polars'], help="Choose the data processing engine")
    return parser.parse_args()


if __name__ == '__main__':
    args = get_cli_args()
    config = ServerConfig(engine=args.engine)
    run_server(config)
