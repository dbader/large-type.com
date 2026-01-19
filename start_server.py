#!/usr/bin/env python3
"""
Local Network Server for Fun-Type Application

This script starts a simple HTTP server that hosts the application
on your local network, making it accessible from other computers on the LAN.
"""

import http.server
import socketserver
import socket
import sys
from pathlib import Path

# Configuration
PORT = 8000
HOST = "0.0.0.0"  # Bind to all network interfaces


def get_local_ip():
    """Get the local IP address of this machine on the LAN."""
    try:
        # Create a socket to determine the local IP
        # We don't actually connect, just use it to determine routing
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"


def main():
    # Change to the script's directory
    script_dir = Path(__file__).parent.resolve()
    os.chdir(script_dir)

    # Get local IP address
    local_ip = get_local_ip()

    # Create server
    Handler = http.server.SimpleHTTPRequestHandler

    try:
        with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
            print("=" * 70)
            print("🚀 Fun-Type Server Started!")
            print("=" * 70)
            print()
            print("📱 Access from THIS computer:")
            print(f"   http://localhost:{PORT}")
            print()
            print("🌐 Access from OTHER computers on your local network:")
            print(f"   http://{local_ip}:{PORT}")
            print()
            print("💡 Tips:")
            print("   - Make sure devices are on the same WiFi/network")
            print("   - Check firewall settings if connection fails")
            print("   - Press Ctrl+C to stop the server")
            print()
            print("=" * 70)
            print()

            # Start serving
            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n\n👋 Server stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98 or e.errno == 48:  # Address already in use
            print(f"\n❌ Error: Port {PORT} is already in use.")
            print("   Try closing other applications or use a different port.")
            sys.exit(1)
        else:
            raise


if __name__ == "__main__":
    import os
    main()
