#!/usr/bin/env bash
cd "$(dirname "$0")"

# Runs completely without Node.js using Python3 or Bun
if command -v python3 &>/dev/null; then
  python3 serve.py "$@"
elif command -v bun &>/dev/null; then
  bun --bun -e "
    const server = Bun.serve({
      port: 8080,
      async fetch(req) {
        let p = '.' + decodeURIComponent(new URL(req.url).pathname);
        if (p.endsWith('/')) p += 'index.html';
        let f = Bun.file(p);
        if (!(await f.exists()) && !p.slice(2).includes('.')) {
          f = Bun.file('./index.html');
        }
        if (await f.exists()) return new Response(f);
        return new Response('Not found', { status: 404 });
      }
    });
    console.log('Serving John Doe Portfolio on http://localhost:' + server.port);
  "
else
  echo "Error: Python 3 or Bun is required to serve locally without Node.js."
  exit 1
fi
