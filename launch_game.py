import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    # Try port 8080 or fallback to 8081..
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print(f"==================================================")
                print(f"★ NEON RUMBLE: ASTRAL CLASH - RETRO ARCADE SERVER ★")
                print(f"==================================================")
                print(f"Game running at: http://localhost:{port}/index.html")
                print(f"Opening browser... Press Ctrl+C to stop.")
                webbrowser.open(f"http://localhost:{port}/index.html")
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == "__main__":
    run()
