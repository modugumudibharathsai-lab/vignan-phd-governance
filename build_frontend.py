import os
import subprocess
import sys

jsx_file = "frontend/static/app.jsx"
js_file = "frontend/static/app.js"

if not os.path.exists(jsx_file):
    print(f"Error: {jsx_file} not found!")
    sys.exit(1)

print("Transpiling JSX to pre-compiled JS with esbuild...")
npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
res = subprocess.run([npx_cmd, "esbuild", jsx_file, f"--outfile={js_file}", "--target=es2020"], capture_output=True, text=True, shell=True)
if res.returncode == 0:
    print("Success! Pre-compiled JS created at", js_file)
else:
    print("esbuild failed:", res.stderr)
    sys.exit(1)
