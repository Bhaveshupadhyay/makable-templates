#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import sys
import mimetypes

mimetypes.add_type('application/wasm', '.wasm')
mimetypes.add_type('application/octet-stream', '.hdr')
mimetypes.add_type('application/octet-stream', '.enc')
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('image/x-icon', '.ico')

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # SPA routing fallback: if path is not a file and has no extension, serve index.html
        path = self.translate_path(self.path)
        if not os.path.exists(path) and '.' not in os.path.basename(self.path):
            self.path = '/index.html'
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"\n========================================================")
        print(f"  John Doe Portfolio running at: {url}")
        print(f"  Root Directory: {DIRECTORY}")
        print(f"  Press Ctrl+C to terminate the server.")
        print(f"========================================================\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    run()
