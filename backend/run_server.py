import sys
import os

# Add backend root to sys.path so package 'src' is importable as top-level
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.api.main import app

if __name__ == '__main__':
    import uvicorn
    # Run without the reloader here to keep behavior deterministic in this script
    uvicorn.run(app, host='127.0.0.1', port=8001, log_level='info')
