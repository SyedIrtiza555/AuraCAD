import os
import sys
import subprocess
import urllib.request
import json
import time

URLS_MD_PATH = os.path.join(os.path.dirname(__file__), 'urls.md')
VITE_PORT = 3000
PB_PORT = 8090

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    print("=" * 60)
    print(" 🚀 AuraCAD Digital Office - Control Panel (TUI)")
    print("=" * 60)

def check_port(port):
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_port(port):
    if os.name == 'nt':
        out = subprocess.run(['netstat', '-ano'], capture_output=True, text=True).stdout
        lines = [line.strip() for line in out.splitlines() if f':{port}' in line and 'LISTENING' in line]
        for line in lines:
            parts = line.split()
            pid = parts[-1]
            if pid != '0':
                subprocess.run(['taskkill', '/F', '/PID', pid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print(f"[+] Killed process {pid} on port {port}")
                return True
    return False

def show_status():
    print("\n--- Server Status ---")
    vite_running = check_port(VITE_PORT)
    pb_running = check_port(PB_PORT)
    
    print(f"Frontend (Vite)      : {'🟢 RUNNING (Port 3000)' if vite_running else '🔴 STOPPED'}")
    print(f"Backend (PocketBase) : {'🟢 RUNNING (Port 8090)' if pb_running else '🔴 STOPPED'}")
    
    cf_tunnel = "🔴 STOPPED"
    if os.name == 'nt':
        out = subprocess.run(['tasklist'], capture_output=True, text=True).stdout
        if 'cloudflared.exe' in out:
            cf_tunnel = "🟢 RUNNING"
            
    print(f"Cloudflare Tunnel    : {cf_tunnel}")
    input("\nPress ENTER to return to menu...")

def run_vite():
    if check_port(VITE_PORT):
        print("Vite is already running!")
        time.sleep(1.5)
        return
    print("Starting Vite in a new window...")
    cwd = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    os.system(f'cd /d "{cwd}" && start "AuraCAD Vite Server" cmd /k "npm run dev"')
    print("Launched Vite!")
    time.sleep(1.5)

def run_pocketbase():
    if check_port(PB_PORT):
        print("PocketBase is already running!")
        time.sleep(1.5)
        return
    print("Starting PocketBase in a new window...")
    cwd = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    os.system(f'cd /d "{cwd}" && start "AuraCAD PocketBase" cmd /k "pocketbase serve"')
    print("Launched PocketBase!")
    time.sleep(1.5)

def stop_all():
    print("\nStopping services...")
    kill_port(VITE_PORT)
    kill_port(PB_PORT)
    if os.name == 'nt':
        subprocess.run(['taskkill', '/F', '/IM', 'cloudflared.exe'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("All services stopped.")
    time.sleep(1.5)

def tunneling_menu():
    while True:
        clear_screen()
        print_header()
        print("--- Tunneling Options ---")
        print("1. Start Cloudflare Quick Tunnel (Localhost:3000)")
        print("2. Stop Cloudflare Tunnel")
        print("0. Back to Main Menu")
        
        choice = input("\nSelect option [0-2]: ")
        
        if choice == '1':
            print("Starting Cloudflare Tunnel...")
            cwd = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
            os.system(f'cd /d "{cwd}" && start "AuraCAD Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:3000"')
            print("Tunnel launched in new window! Check the new console for the URL.")
            input("\nPress ENTER to continue...")
        elif choice == '2':
            if os.name == 'nt':
                subprocess.run(['taskkill', '/F', '/IM', 'cloudflared.exe'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print("Cloudflare tunnel stopped.")
                time.sleep(1.5)
        elif choice == '0':
            break

def show_urls():
    clear_screen()
    print_header()
    if os.path.exists(URLS_MD_PATH):
        with open(URLS_MD_PATH, 'r', encoding='utf-8') as f:
            print(f.read())
    else:
        print("cr/urls.md not found.")
    input("\nPress ENTER to return to menu...")

def fetch_api():
    clear_screen()
    print_header()
    print("--- API Output Testing ---")
    
    if not check_port(PB_PORT):
        print("PocketBase is not running on port 8090!")
        input("\nPress ENTER to return...")
        return
        
    try:
        url = "http://localhost:8090/api/health"
        print(f"GET {url}")
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=3) as response:
            data = response.read()
            parsed = json.loads(data)
            print("\nResponse:")
            print(json.dumps(parsed, indent=2))
    except Exception as e:
        print(f"API Request failed: {e}")
        
    input("\nPress ENTER to return to menu...")

def main_loop():
    while True:
        clear_screen()
        print_header()
        print(" 1 | ▶ Start Vite (Frontend)")
        print(" 2 | ▶ Start PocketBase (Backend)")
        print(" 3 | ⏹ Stop All Services")
        print(" 4 | 📊 Check Status")
        print(" 5 | 🌐 Tunneling Options")
        print(" 6 | 🔗 Show Environment URLs")
        print(" 7 | 📡 Test API Endpoint")
        print(" 0 | ❌ Exit")
        print("=" * 60)
        
        choice = input("Enter choice (using numpad/keyboard): ")
        
        if choice == '1':
            run_vite()
        elif choice == '2':
            run_pocketbase()
        elif choice == '3':
            stop_all()
        elif choice == '4':
            show_status()
        elif choice == '5':
            tunneling_menu()
        elif choice == '6':
            show_urls()
        elif choice == '7':
            fetch_api()
        elif choice == '0':
            clear_screen()
            print("Exiting TUI Control Panel. Goodbye!")
            sys.exit(0)

if __name__ == "__main__":
    main_loop()
