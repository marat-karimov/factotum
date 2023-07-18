import os
import threading
import time
import argparse
import psutil
import sys
from flask import Flask, request, abort

from server.processor import DataProcessor
from server.validator import SqlValidator
from server.converter import ReadConverter

from server.duckdb_engine import DuckDBEngine
from server.polars_engine import PolarsEngine

heartbeat_timeout_sec = 30

last_heartbeat_time = time.time()

processor: DataProcessor = None
converter = ReadConverter()

app = Flask(__name__)


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


@app.route('/heartbeat', methods=['POST'])
def heartbeat():
    global last_heartbeat_time
    last_heartbeat_time = time.time()

    return get_memory_usage()


def init_engine(engine):
    global processor

    if engine == 'duckdb':
        duckdb_engine = DuckDBEngine(converter)
        validator = SqlValidator(duckdb_engine)
        processor = DataProcessor(duckdb_engine, validator)
    elif engine == 'polars':
        polars_engine = PolarsEngine(converter)
        validator = SqlValidator(polars_engine)
        processor = DataProcessor(polars_engine, validator)
    else:
        raise Exception('Unknown engine')


@app.route('/import_file', methods=['POST'])
def import_file():
    return processor.import_file(request.get_json())


@app.route('/run_sql', methods=['POST'])
def run_sql():
    return processor.run_sql(request.get_json())


@app.route('/get_schema', methods=['POST'])
def get_schema():
    return processor.get_schema(request.get_json())


@app.route('/export_file', methods=['POST'])
def export_file():
    return processor.export_file(request.get_json())


@app.route('/validate', methods=['POST'])
def validate():
    return processor.validate(request.get_json())


@app.route('/kill', methods=['POST'])
def kill_route():
    return kill(request.get_json())


def check_heartbeat():
    global last_heartbeat_time
    while True:
        if time.time() - last_heartbeat_time > heartbeat_timeout_sec:
            print('No heartbeat received. Self-destructing...')
            converter.cleanup()
            os._exit(0)
        time.sleep(1)


def run_server(engine):
    host = '127.0.0.1'
    port = 49213

    init_engine(engine)

    heartbeat_thread = threading.Thread(target=check_heartbeat)
    heartbeat_thread.daemon = True
    heartbeat_thread.start()

    try:
        app.run(host=host, port=port)
    except KeyboardInterrupt:
        print('Server stopped.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('engine', type=str, choices=['duckdb', 'polars'])
    args = parser.parse_args()
    run_server(args.engine)
