"""
Cyberix AI - Application Entry Point
"""
import uvicorn
import os
import sys
from pathlib import Path

if __name__ == "__main__":
    # Add backend directory to Python path so 'app' module can be found
    backend_path = Path(__file__).parent / "backend"
    sys.path.insert(0, str(backend_path))
    
    # Change working directory to backend
    os.chdir(str(backend_path))
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
