import sys
import os
import time
import subprocess
import webbrowser
import uvicorn

def find_chrome():
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe")
    ]
    for path in chrome_paths:
        if os.path.exists(path):
            return path
    return None

def open_browser(url):
    chrome_path = find_chrome()
    if chrome_path:
        print(f"[LAUNCHER] Opening Google Chrome from: {chrome_path}")
        try:
            subprocess.Popen([chrome_path, url])
            return
        except Exception as e:
            print(f"[LAUNCHER] Warning launching Chrome executable directly: {e}")
    
    print(f"[LAUNCHER] Launching default web browser for: {url}")
    webbrowser.open(url)

import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        # Connect to an arbitrary public IP to determine the outbound interface
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"

import re

def start_cloudflare_tunnel():
    cf_exe = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cloudflared.exe")
    if not os.path.exists(cf_exe):
        return None
    try:
        proc = subprocess.Popen(
            [cf_exe, "tunnel", "--url", "http://localhost:8000"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")
        start_time = time.time()
        for line in iter(proc.stderr.readline, ''):
            match = url_pattern.search(line)
            if match:
                url = match.group(0)
                with open("public_url.txt", "w", encoding="utf-8") as f:
                    f.write(url)
                return url
            if time.time() - start_time > 25:
                break
    except Exception as e:
        print(f"[TUNNEL] Note: {e}")
    return None

if __name__ == "__main__":
    # Ensure project root is in PYTHONPATH
    project_root = os.path.dirname(os.path.abspath(__file__))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    local_ip = get_local_ip()

    print("=" * 76)
    print("  VFSTR Vignan University Multi-Agent Doctoral Governance Platform")
    print("  Active Core: Agents 25, 17, 18, 20, 59, 71")
    print("=" * 76)
    print(f"  [💻 This Computer]:          http://127.0.0.1:8000")
    print(f"  [📶 Same Wi-Fi Network]:     http://{local_ip}:8000")

    # Read active public tunnel if available
    public_url = None
    if os.path.exists("public_url.txt"):
        try:
            with open("public_url.txt", "r", encoding="utf-8") as f:
                public_url = f.read().strip()
        except Exception:
            pass

    if public_url:
        print(f"  [🌍 WORLDWIDE PUBLIC HTTPS]: {public_url}")
        print("=" * 76)
        print("  * Worldwide HTTPS works on ANY phone (iPhone/Android), ANY mobile network")
        print("    (4G/5G/any Wi-Fi), and ALL browsers (Chrome, Safari, Firefox, Edge, etc.)")
    print("=" * 76)

    import threading
    def delayed_open():
        time.sleep(1.8)
        open_browser("http://127.0.0.1:8000")

    threading.Thread(target=delayed_open, daemon=True).start()

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, log_level="info")
