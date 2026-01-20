#!/usr/bin/env python3
"""
Generate a manifest.json file listing all available word images.

This script scans the words/ directory and creates a lookup table
mapping word names to their available image files. This eliminates
the need for multiple HEAD requests when loading images.
"""

import json
import os
from pathlib import Path
import re


def generate_manifest():
    """Generate manifest of all word images."""
    words_dir = Path(__file__).parent / "words"

    if not words_dir.exists():
        print(f"Error: {words_dir} directory not found")
        return

    # Dictionary to store word -> list of image files
    manifest = {}

    # Supported image extensions
    extensions = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}

    # Scan all files in words directory
    for file_path in sorted(words_dir.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() in extensions:
            filename = file_path.name

            # Use the full stem (filename without extension) as the base key
            stem = file_path.stem
            extension = file_path.suffix.lstrip('.')

            # Create a unique key combining stem and extension
            # This differentiates files like word.jpg and word.svg
            key = f"{stem.lower()}-{extension.lower()}"

            # Add to manifest
            if key not in manifest:
                manifest[key] = []
            manifest[key].append(f"words/{filename}")

    # Write manifest to file
    manifest_path = Path(__file__).parent / "words" / "manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2, sort_keys=True)

    print(f"✅ Generated manifest with {len(manifest)} words")
    print(f"📝 Saved to: {manifest_path}")
    print(f"📊 Total image files: {sum(len(files) for files in manifest.values())}")


if __name__ == "__main__":
    generate_manifest()
