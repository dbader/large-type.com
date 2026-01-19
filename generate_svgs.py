#!/usr/bin/env python3
"""
Generate simple SVG graphics for top 100 early reader nouns.
Based on Dolch 95 noun list plus 5 additional common nouns.
"""

import os

# Directory to save SVGs
OUTPUT_DIR = "/home/user/fun-type/words"

# SVG template
def create_svg(content, viewbox="0 0 200 200"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" width="200" height="200">
{content}
</svg>'''

# Dictionary of nouns with their SVG content
NOUN_SVGS = {
    "apple": '''<circle cx="100" cy="110" r="60" fill="#ff4444" stroke="#000" stroke-width="2"/>
    <path d="M 100 50 Q 90 30 80 40" stroke="#654321" stroke-width="3" fill="none"/>
    <ellipse cx="110" cy="95" rx="15" ry="20" fill="#fff" opacity="0.3"/>''',

    "baby": '''<circle cx="100" cy="70" r="35" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="90" cy="65" r="5" fill="#000"/>
    <circle cx="110" cy="65" r="5" fill="#000"/>
    <path d="M 85 80 Q 100 90 115 80" stroke="#000" stroke-width="2" fill="none"/>
    <circle cx="100" cy="150" r="45" fill="#87ceeb" stroke="#000" stroke-width="2"/>''',

    "back": '''<path d="M 60 100 L 100 60 L 100 85 L 140 85 L 140 115 L 100 115 L 100 140 Z" fill="#4169e1" stroke="#000" stroke-width="2"/>''',

    "ball": '''<circle cx="100" cy="100" r="60" fill="#ff6b6b" stroke="#000" stroke-width="2"/>
    <path d="M 100 40 Q 120 100 100 160" stroke="#000" stroke-width="2" fill="none"/>
    <path d="M 40 100 Q 100 120 160 100" stroke="#000" stroke-width="2" fill="none"/>''',

    "bear": '''<circle cx="70" cy="60" r="20" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="130" cy="60" r="20" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="110" r="50" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="90" cy="105" r="5" fill="#000"/>
    <circle cx="110" cy="105" r="5" fill="#000"/>
    <circle cx="100" cy="120" r="8" fill="#000"/>''',

    "bed": '''<rect x="30" y="110" width="140" height="60" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="30" y="80" width="140" height="30" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="20" y="110" width="15" height="60" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="165" y="110" width="15" height="60" fill="#654321" stroke="#000" stroke-width="2"/>''',

    "bell": '''<path d="M 100 50 L 70 120 L 130 120 Z" fill="#ffd700" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="30" r="8" fill="#ffd700" stroke="#000" stroke-width="2"/>
    <rect x="98" y="30" width="4" height="20" fill="#000"/>
    <circle cx="100" cy="130" r="8" fill="#000"/>''',

    "bird": '''<circle cx="110" cy="90" r="40" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <circle cx="95" cy="80" r="15" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <circle cx="90" cy="75" r="4" fill="#000"/>
    <path d="M 85 85 L 75 82 L 85 80" fill="#ffa500" stroke="#000" stroke-width="1"/>
    <path d="M 140 85 L 170 75 L 175 85 L 170 95 L 140 85" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <path d="M 110 125 L 95 150 L 95 155 L 105 150" fill="#ffa500" stroke="#000" stroke-width="2"/>''',

    "birthday": '''<rect x="60" y="100" width="80" height="60" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="95" y="70" width="10" height="30" fill="#ffff00" stroke="#000" stroke-width="1"/>
    <ellipse cx="100" cy="70" rx="8" ry="12" fill="#ff0000"/>
    <path d="M 100 60 Q 98 55 100 50" stroke="#ffa500" stroke-width="2" fill="none"/>''',

    "boat": '''<path d="M 50 120 L 70 160 L 130 160 L 150 120 Z" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <polygon points="100,40 100,120 105,120 105,40" fill="#654321" stroke="#000" stroke-width="2"/>
    <path d="M 100 40 L 150 80 L 100 80 Z" fill="#fff" stroke="#000" stroke-width="2"/>''',

    "box": '''<rect x="60" y="80" width="80" height="80" fill="#deb887" stroke="#000" stroke-width="2"/>
    <line x1="60" y1="80" x2="90" y2="50" stroke="#000" stroke-width="2"/>
    <line x1="140" y1="80" x2="170" y2="50" stroke="#000" stroke-width="2"/>
    <line x1="140" y1="160" x2="170" y2="130" stroke="#000" stroke-width="2"/>
    <polygon points="90,50 170,50 170,130 140,160 60,160 60,80" fill="#f4a460" stroke="#000" stroke-width="2"/>''',

    "boy": '''<circle cx="100" cy="60" r="25" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="55" r="4" fill="#000"/>
    <circle cx="108" cy="55" r="4" fill="#000"/>
    <path d="M 90 68 Q 100 73 110 68" stroke="#000" stroke-width="2" fill="none"/>
    <rect x="80" y="90" width="40" height="50" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="65" y="95" width="15" height="35" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="120" y="95" width="15" height="35" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="80" y="140" width="15" height="30" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="105" y="140" width="15" height="30" fill="#654321" stroke="#000" stroke-width="2"/>''',

    "bread": '''<ellipse cx="100" cy="120" rx="60" ry="40" fill="#daa520" stroke="#000" stroke-width="2"/>
    <path d="M 50 110 Q 100 90 150 110" fill="#f4a460" stroke="#000" stroke-width="1"/>
    <line x1="70" y1="105" x2="70" y2="135" stroke="#8b4513" stroke-width="1"/>
    <line x1="85" y1="100" x2="85" y2="135" stroke="#8b4513" stroke-width="1"/>
    <line x1="100" y1="98" x2="100" y2="138" stroke="#8b4513" stroke-width="1"/>
    <line x1="115" y1="100" x2="115" y2="135" stroke="#8b4513" stroke-width="1"/>
    <line x1="130" y1="105" x2="130" y2="135" stroke="#8b4513" stroke-width="1"/>''',

    "brother": '''<circle cx="100" cy="60" r="25" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="55" r="4" fill="#000"/>
    <circle cx="108" cy="55" r="4" fill="#000"/>
    <path d="M 90 68 Q 100 73 110 68" stroke="#000" stroke-width="2" fill="none"/>
    <rect x="80" y="90" width="40" height="50" fill="#228b22" stroke="#000" stroke-width="2"/>
    <rect x="65" y="95" width="15" height="35" fill="#228b22" stroke="#000" stroke-width="2"/>
    <rect x="120" y="95" width="15" height="35" fill="#228b22" stroke="#000" stroke-width="2"/>
    <rect x="80" y="140" width="15" height="30" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <rect x="105" y="140" width="15" height="30" fill="#2c5282" stroke="#000" stroke-width="2"/>''',

    "cake": '''<rect x="50" y="120" width="100" height="30" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="60" y="90" width="80" height="30" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <rect x="55" y="150" width="90" height="10" fill="#fff" stroke="#000" stroke-width="1"/>
    <rect x="95" y="60" width="10" height="30" fill="#ffff00" stroke="#000" stroke-width="1"/>
    <ellipse cx="100" cy="60" rx="8" ry="12" fill="#ff0000"/>
    <path d="M 100 50 Q 98 45 100 40" stroke="#ffa500" stroke-width="2" fill="none"/>''',

    "car": '''<rect x="50" y="100" width="100" height="40" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <path d="M 70 100 L 80 70 L 120 70 L 130 100" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <rect x="85" y="75" width="30" height="22" fill="#87ceeb" stroke="#000" stroke-width="1"/>
    <circle cx="70" cy="140" r="15" fill="#333" stroke="#000" stroke-width="2"/>
    <circle cx="70" cy="140" r="8" fill="#666"/>
    <circle cx="130" cy="140" r="15" fill="#333" stroke="#000" stroke-width="2"/>
    <circle cx="130" cy="140" r="8" fill="#666"/>''',

    "cat": '''<circle cx="100" cy="110" r="40" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="80" r="30" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <polygon points="70,60 65,40 75,55" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <polygon points="130,60 135,40 125,55" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <circle cx="90" cy="75" r="5" fill="#000"/>
    <circle cx="110" cy="75" r="5" fill="#000"/>
    <polygon points="100,85 95,90 105,90" fill="#ffb6c1"/>
    <path d="M 100 90 L 100 95" stroke="#000" stroke-width="2"/>
    <path d="M 70 90 L 50 85" stroke="#000" stroke-width="2"/>
    <path d="M 70 95 L 50 95" stroke="#000" stroke-width="2"/>
    <path d="M 130 90 L 150 85" stroke="#000" stroke-width="2"/>
    <path d="M 130 95 L 150 95" stroke="#000" stroke-width="2"/>''',

    "chair": '''<rect x="70" y="50" width="60" height="10" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="70" y="60" width="10" height="40" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="70" y="100" width="60" height="10" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="70" y="110" width="10" height="60" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="120" y="110" width="10" height="60" fill="#8b4513" stroke="#000" stroke-width="2"/>''',

    "chicken": '''<circle cx="110" cy="95" r="35" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="95" cy="70" r="20" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="68" r="3" fill="#000"/>
    <polygon points="85,70 75,68 85,66" fill="#ffa500" stroke="#000" stroke-width="1"/>
    <path d="M 95 50 L 90 45 L 95 55 L 100 45 L 95 55" fill="#ff0000" stroke="#000" stroke-width="1"/>
    <polygon points="110,125 100,150 105,150 110,130" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <polygon points="110,125 120,150 115,150 110,130" fill="#ffa500" stroke="#000" stroke-width="2"/>''',

    "children": '''<circle cx="70" cy="50" r="18" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="58" y="70" width="24" height="30" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="58" y="100" width="10" height="20" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <rect x="72" y="100" width="10" height="20" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <circle cx="130" cy="50" r="18" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="118" y="70" width="24" height="30" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="118" y="100" width="10" height="20" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="132" y="100" width="10" height="20" fill="#654321" stroke="#000" stroke-width="2"/>''',

    "christmas": '''<polygon points="100,30 120,70 140,70 100,40 60,70 80,70" fill="#228b22" stroke="#000" stroke-width="2"/>
    <polygon points="100,60 115,95 130,95 100,70 70,95 85,95" fill="#228b22" stroke="#000" stroke-width="2"/>
    <polygon points="100,90 110,120 125,120 100,100 75,120 90,120" fill="#228b22" stroke="#000" stroke-width="2"/>
    <rect x="90" y="120" width="20" height="30" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="35" r="8" fill="#ffff00" stroke="#ffd700" stroke-width="2"/>
    <circle cx="85" cy="75" r="5" fill="#ff0000"/>
    <circle cx="110" cy="80" r="5" fill="#ffd700"/>
    <circle cx="95" cy="105" r="5" fill="#4169e1"/>''',

    "coat": '''<path d="M 70 60 L 70 150 L 90 150 L 90 100 L 110 100 L 110 150 L 130 150 L 130 60 L 115 60 L 110 80 L 100 70 L 90 80 L 85 60 Z" fill="#8b0000" stroke="#000" stroke-width="2"/>
    <circle cx="90" cy="80" r="4" fill="#000"/>
    <circle cx="90" cy="95" r="4" fill="#000"/>
    <circle cx="90" cy="110" r="4" fill="#000"/>''',

    "corn": '''<ellipse cx="100" cy="100" rx="25" ry="55" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <path d="M 75 70 Q 60 60 55 90 L 75 100" fill="#228b22" stroke="#000" stroke-width="2"/>
    <path d="M 125 70 Q 140 60 145 90 L 125 100" fill="#228b22" stroke="#000" stroke-width="2"/>
    <line x1="90" y1="70" x2="90" y2="130" stroke="#daa520" stroke-width="1"/>
    <line x1="95" y1="65" x2="95" y2="135" stroke="#daa520" stroke-width="1"/>
    <line x1="100" y1="65" x2="100" y2="135" stroke="#daa520" stroke-width="1"/>
    <line x1="105" y1="65" x2="105" y2="135" stroke="#daa520" stroke-width="1"/>
    <line x1="110" y1="70" x2="110" y2="130" stroke="#daa520" stroke-width="1"/>''',

    "cow": '''<ellipse cx="100" cy="110" rx="50" ry="35" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="80" cy="80" r="20" fill="#fff" stroke="#000" stroke-width="2"/>
    <ellipse cx="75" cy="75" rx="8" ry="12" fill="#fff" stroke="#000" stroke-width="2"/>
    <ellipse cx="85" cy="75" rx="8" ry="12" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="72" cy="75" r="4" fill="#000"/>
    <circle cx="82" cy="75" r="4" fill="#000"/>
    <ellipse cx="77" cy="88" rx="8" ry="6" fill="#ffb6c1"/>
    <rect x="60" y="130" width="10" height="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <rect x="80" y="130" width="10" height="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <rect x="110" y="130" width="10" height="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <rect x="130" y="130" width="10" height="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="60" cy="110" r="8" fill="#000"/>
    <circle cx="140" cy="110" r="8" fill="#000"/>''',

    "day": '''<circle cx="100" cy="80" r="35" fill="#ffff00" stroke="#ffa500" stroke-width="2"/>
    <line x1="100" y1="30" x2="100" y2="45" stroke="#ffa500" stroke-width="3"/>
    <line x1="100" y1="115" x2="100" y2="130" stroke="#ffa500" stroke-width="3"/>
    <line x1="50" y1="80" x2="65" y2="80" stroke="#ffa500" stroke-width="3"/>
    <line x1="135" y1="80" x2="150" y2="80" stroke="#ffa500" stroke-width="3"/>
    <line x1="65" y1="50" x2="75" y2="60" stroke="#ffa500" stroke-width="3"/>
    <line x1="125" y1="60" x2="135" y2="50" stroke="#ffa500" stroke-width="3"/>
    <line x1="65" y1="110" x2="75" y2="100" stroke="#ffa500" stroke-width="3"/>
    <line x1="125" y1="100" x2="135" y2="110" stroke="#ffa500" stroke-width="3"/>
    <rect x="40" y="150" width="120" height="20" fill="#228b22" stroke="#006400" stroke-width="2"/>''',

    "dog": '''<ellipse cx="110" cy="110" rx="45" ry="35" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="80" cy="85" r="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <ellipse cx="60" cy="75" rx="8" ry="15" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <ellipse cx="90" cy="75" rx="8" ry="15" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="72" cy="80" r="4" fill="#000"/>
    <circle cx="82" cy="80" r="4" fill="#000"/>
    <circle cx="77" cy="92" r="6" fill="#000"/>
    <line x1="77" y1="92" x2="77" y2="98" stroke="#000" stroke-width="2"/>
    <path d="M 70 98 Q 77 102 84 98" stroke="#000" stroke-width="2" fill="none"/>
    <ellipse cx="150" cy="105" rx="15" ry="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="65" y="135" width="12" height="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="90" y="135" width="12" height="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="120" y="135" width="12" height="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="145" y="135" width="12" height="25" fill="#8b4513" stroke="#000" stroke-width="2"/>''',

    "doll": '''<circle cx="100" cy="60" r="25" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="55" r="4" fill="#4169e1"/>
    <circle cx="108" cy="55" r="4" fill="#4169e1"/>
    <path d="M 90 68 Q 100 73 110 68" stroke="#ff69b4" stroke-width="2" fill="none"/>
    <circle cx="75" cy="45" r="8" fill="#ffb6c1"/>
    <circle cx="125" cy="45" r="8" fill="#ffb6c1"/>
    <path d="M 70 85 L 60 130 L 70 130 L 80 95" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <path d="M 130 85 L 140 130 L 130 130 L 120 95" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <ellipse cx="100" cy="105" rx="30" ry="20" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="85" y="125" width="12" height="35" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="103" y="125" width="12" height="35" fill="#ffd4a3" stroke="#000" stroke-width="2"/>''',

    "door": '''<rect x="60" y="40" width="80" height="130" fill="#8b4513" stroke="#000" stroke-width="3"/>
    <rect x="70" y="55" width="25" height="35" fill="#87ceeb" stroke="#000" stroke-width="2"/>
    <rect x="105" y="55" width="25" height="35" fill="#87ceeb" stroke="#000" stroke-width="2"/>
    <circle cx="125" cy="105" r="5" fill="#ffd700" stroke="#000" stroke-width="1"/>''',

    "duck": '''<circle cx="90" cy="80" r="20" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <circle cx="88" cy="75" r="3" fill="#000"/>
    <path d="M 75 80 L 65 82 L 75 84" fill="#ffa500" stroke="#000" stroke-width="1"/>
    <ellipse cx="110" cy="105" rx="40" ry="30" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <ellipse cx="145" cy="105" rx="12" ry="20" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <path d="M 110 130 Q 100 145 95 150" stroke="#ffa500" stroke-width="3" fill="none"/>
    <path d="M 115 130 Q 125 145 130 150" stroke="#ffa500" stroke-width="3" fill="none"/>''',

    "egg": '''<ellipse cx="100" cy="100" rx="45" ry="60" fill="#fff" stroke="#000" stroke-width="2"/>
    <ellipse cx="110" cy="85" rx="15" ry="20" fill="#fff" opacity="0.4"/>''',

    "eye": '''<ellipse cx="100" cy="100" rx="60" ry="40" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="100" r="25" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="100" r="12" fill="#000"/>
    <circle cx="105" cy="95" r="5" fill="#fff"/>''',

    "farm": '''<path d="M 100 40 L 60 80 L 70 80 L 70 140 L 130 140 L 130 80 L 140 80 Z" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <rect x="85" y="100" width="30" height="40" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="95" y="110" width="10" height="15" fill="#87ceeb" stroke="#000" stroke-width="1"/>
    <line x1="75" y1="80" x2="125" y2="80" stroke="#fff" stroke-width="3"/>
    <line x1="80" y1="90" x2="120" y2="90" stroke="#fff" stroke-width="3"/>
    <rect x="30" y="140" width="140" height="20" fill="#228b22" stroke="#006400" stroke-width="2"/>''',

    "farmer": '''<circle cx="100" cy="55" r="20" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <path d="M 75 50 Q 75 35 85 35 L 115 35 Q 125 35 125 50 Q 125 55 120 55 L 80 55 Q 75 55 75 50" fill="#daa520" stroke="#000" stroke-width="2"/>
    <ellipse cx="100" cy="35" rx="25" ry="8" fill="#daa520" stroke="#000" stroke-width="2"/>
    <rect x="80" y="80" width="40" height="45" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="65" y="85" width="15" height="30" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="120" y="85" width="15" height="30" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="80" y="125" width="15" height="35" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="105" y="125" width="15" height="35" fill="#654321" stroke="#000" stroke-width="2"/>''',

    "father": '''<circle cx="100" cy="55" r="22" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="93" cy="52" r="3" fill="#000"/>
    <circle cx="107" cy="52" r="3" fill="#000"/>
    <path d="M 92 63 Q 100 67 108 63" stroke="#000" stroke-width="2" fill="none"/>
    <rect x="78" y="82" width="44" height="48" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="62" y="87" width="16" height="35" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="122" y="87" width="16" height="35" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="78" y="130" width="18" height="35" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <rect x="104" y="130" width="18" height="35" fill="#2c5282" stroke="#000" stroke-width="2"/>''',

    "feet": '''<ellipse cx="75" cy="120" rx="30" ry="20" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <ellipse cx="75" cy="100" rx="8" ry="12" fill="#ffd4a3" stroke="#000" stroke-width="1"/>
    <ellipse cx="85" cy="100" rx="8" ry="12" fill="#ffd4a3" stroke="#000" stroke-width="1"/>
    <ellipse cx="95" cy="100" rx="8" ry="12" fill="#ffd4a3" stroke="#000" stroke-width="1"/>
    <ellipse cx="125" cy="120" rx="30" ry="20" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <ellipse cx="115" cy="100" rx="8" ry="12" fill="#ffd4a3" stroke="#000" stroke-width="1"/>
    <ellipse cx="125" cy="100" rx="8" ry="12" fill="#ffd4a3" stroke="#000" stroke-width="1"/>
    <ellipse cx="135" cy="100" rx="8" ry="12" fill="#ffd4a3" stroke="#000" stroke-width="1"/>''',

    "fire": '''<path d="M 100 150 Q 80 130 85 100 Q 70 90 75 70 Q 80 90 90 80 Q 85 60 95 50 Q 100 70 105 50 Q 115 60 110 80 Q 120 90 125 70 Q 130 90 115 100 Q 120 130 100 150" fill="#ff4500" stroke="#ff6347" stroke-width="2"/>
    <path d="M 100 140 Q 90 125 92 105 Q 85 100 90 85 Q 95 95 100 90 Q 100 75 105 85 Q 110 95 108 105 Q 110 125 100 140" fill="#ffd700" stroke="#ffa500" stroke-width="1"/>
    <ellipse cx="100" cy="160" rx="40" ry="8" fill="#8b4513" opacity="0.3"/>''',

    "fish": '''<ellipse cx="110" cy="100" rx="50" ry="30" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <circle cx="140" cy="95" r="5" fill="#000"/>
    <circle cx="142" cy="94" r="2" fill="#fff"/>
    <path d="M 60 100 L 40 85 L 40 115 Z" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <path d="M 110 70 L 120 55 L 125 70" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <path d="M 110 130 L 120 145 L 125 130" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <line x1="90" y1="95" x2="120" y2="95" stroke="#ff8c00" stroke-width="1"/>
    <line x1="90" y1="100" x2="125" y2="100" stroke="#ff8c00" stroke-width="1"/>
    <line x1="90" y1="105" x2="120" y2="105" stroke="#ff8c00" stroke-width="1"/>''',

    "floor": '''<rect x="30" y="120" width="140" height="50" fill="#deb887" stroke="#000" stroke-width="2"/>
    <line x1="30" y1="135" x2="170" y2="135" stroke="#8b4513" stroke-width="2"/>
    <line x1="30" y1="150" x2="170" y2="150" stroke="#8b4513" stroke-width="2"/>
    <line x1="60" y1="120" x2="60" y2="170" stroke="#8b4513" stroke-width="2"/>
    <line x1="90" y1="120" x2="90" y2="170" stroke="#8b4513" stroke-width="2"/>
    <line x1="120" y1="120" x2="120" y2="170" stroke="#8b4513" stroke-width="2"/>
    <line x1="150" y1="120" x2="150" y2="170" stroke="#8b4513" stroke-width="2"/>''',

    "flower": '''<circle cx="100" cy="80" r="15" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <circle cx="85" cy="70" r="12" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <circle cx="115" cy="70" r="12" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <circle cx="85" cy="90" r="12" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <circle cx="115" cy="90" r="12" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="62" r="12" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="98" r="12" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="98" y="95" width="4" height="60" fill="#228b22" stroke="#000" stroke-width="1"/>
    <ellipse cx="85" cy="120" rx="18" ry="12" fill="#228b22" stroke="#000" stroke-width="2"/>
    <ellipse cx="115" cy="125" rx="15" ry="10" fill="#228b22" stroke="#000" stroke-width="2"/>''',

    "game": '''<rect x="50" y="80" width="100" height="70" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="60" y="90" width="35" height="25" fill="#000" stroke="#333" stroke-width="1"/>
    <circle cx="110" cy="110" r="12" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <circle cx="130" cy="110" r="12" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <circle cx="110" cy="130" r="12" fill="#00ff00" stroke="#000" stroke-width="2"/>
    <circle cx="130" cy="130" r="12" fill="#0000ff" stroke="#000" stroke-width="2"/>
    <rect x="30" y="100" width="20" height="10" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="150" y="100" width="20" height="10" fill="#4169e1" stroke="#000" stroke-width="2"/>''',

    "garden": '''<rect x="30" y="130" width="140" height="30" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="70" cy="100" r="15" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="68" y="110" width="4" height="20" fill="#228b22" stroke="#000" stroke-width="1"/>
    <circle cx="100" cy="95" r="15" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <rect x="98" y="105" width="4" height="25" fill="#228b22" stroke="#000" stroke-width="1"/>
    <circle cx="130" cy="100" r="15" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <rect x="128" y="110" width="4" height="20" fill="#228b22" stroke="#000" stroke-width="1"/>
    <rect x="45" y="135" width="110" height="5" fill="#654321"/>''',

    "girl": '''<circle cx="100" cy="60" r="25" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="55" r="4" fill="#000"/>
    <circle cx="108" cy="55" r="4" fill="#000"/>
    <path d="M 90 68 Q 100 73 110 68" stroke="#000" stroke-width="2" fill="none"/>
    <circle cx="80" cy="50" r="12" fill="#8b4513"/>
    <circle cx="120" cy="50" r="12" fill="#8b4513"/>
    <circle cx="100" cy="42" r="12" fill="#8b4513"/>
    <path d="M 75 90 L 60 140 L 70 140 L 80 100" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <path d="M 125 90 L 140 140 L 130 140 L 120 100" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <path d="M 80 90 Q 100 85 120 90 Q 100 120 80 90" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="85" y="140" width="12" height="25" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="103" y="140" width="12" height="25" fill="#ffd4a3" stroke="#000" stroke-width="2"/>''',

    "goodbye": '''<path d="M 80 90 Q 80 70 95 70 L 95 110 L 90 115 L 85 110 L 85 80 Q 85 75 90 75" fill="none" stroke="#000" stroke-width="3"/>
    <circle cx="105" cy="95" r="8" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <path d="M 105 103 L 100 125 L 110 125 L 105 103 M 100 125 L 95 135 M 110 125 L 115 135" stroke="#000" stroke-width="2" fill="none"/>
    <path d="M 105 103 L 95 115 M 105 103 L 115 115" stroke="#000" stroke-width="2"/>''',

    "grass": '''<rect x="30" y="130" width="140" height="40" fill="#228b22" stroke="#006400" stroke-width="2"/>
    <path d="M 50 130 Q 48 110 50 90" stroke="#32cd32" stroke-width="3" fill="none"/>
    <path d="M 70 130 Q 72 105 70 85" stroke="#32cd32" stroke-width="3" fill="none"/>
    <path d="M 90 130 Q 88 100 90 75" stroke="#32cd32" stroke-width="3" fill="none"/>
    <path d="M 110 130 Q 112 105 110 80" stroke="#32cd32" stroke-width="3" fill="none"/>
    <path d="M 130 130 Q 128 110 130 85" stroke="#32cd32" stroke-width="3" fill="none"/>
    <path d="M 150 130 Q 152 100 150 75" stroke="#32cd32" stroke-width="3" fill="none"/>''',

    "ground": '''<ellipse cx="100" cy="150" rx="80" ry="20" fill="#8b4513" stroke="#654321" stroke-width="2"/>
    <ellipse cx="70" cy="140" rx="25" ry="8" fill="#a0522d"/>
    <ellipse cx="130" cy="145" rx="30" ry="10" fill="#a0522d"/>
    <ellipse cx="100" cy="138" rx="20" ry="6" fill="#a0522d"/>''',

    "hand": '''<ellipse cx="100" cy="130" rx="35" ry="25" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="85" y="145" width="30" height="20" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="70" y="75" width="12" height="60" rx="6" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="85" y="70" width="12" height="65" rx="6" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="100" y="65" width="12" height="70" rx="6" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="115" y="70" width="12" height="65" rx="6" fill="#ffd4a3" stroke="#000" stroke-width="2"/>''',

    "head": '''<circle cx="100" cy="100" r="60" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="85" cy="90" r="8" fill="#000"/>
    <circle cx="115" cy="90" r="8" fill="#000"/>
    <path d="M 80 120 Q 100 130 120 120" stroke="#000" stroke-width="3" fill="none"/>
    <circle cx="100" cy="50" r="5" fill="#8b4513"/>
    <ellipse cx="70" cy="65" rx="12" ry="20" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <ellipse cx="130" cy="65" rx="12" ry="20" fill="#ffd4a3" stroke="#000" stroke-width="2"/>''',

    "hill": '''<path d="M 20 150 Q 70 80 100 100 Q 130 120 180 90 L 180 170 L 20 170 Z" fill="#228b22" stroke="#006400" stroke-width="2"/>
    <path d="M 20 150 Q 70 80 100 100" fill="#90ee90" stroke="#006400" stroke-width="1"/>
    <ellipse cx="60" cy="120" rx="15" ry="8" fill="#32cd32"/>
    <ellipse cx="110" cy="130" rx="20" ry="10" fill="#32cd32"/>
    <ellipse cx="150" cy="115" rx="18" ry="9" fill="#32cd32"/>''',

    "home": '''<path d="M 100 40 L 50 90 L 50 160 L 150 160 L 150 90 Z" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <rect x="85" y="110" width="30" height="50" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="65" y="100" width="25" height="25" fill="#87ceeb" stroke="#000" stroke-width="2"/>
    <line x1="77.5" y1="100" x2="77.5" y2="125" stroke="#000" stroke-width="2"/>
    <line x1="65" y1="112.5" x2="90" y2="112.5" stroke="#000" stroke-width="2"/>
    <path d="M 40 90 L 100 30 L 160 90" fill="#ff0000" stroke="#000" stroke-width="2"/>''',

    "horse": '''<ellipse cx="120" cy="110" rx="45" ry="35" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <ellipse cx="80" cy="85" rx="22" ry="28" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <ellipse cx="75" cy="70" rx="12" ry="18" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="72" cy="68" r="3" fill="#000"/>
    <polygon points="70,50 65,40 75,50" fill="#654321" stroke="#000" stroke-width="1"/>
    <polygon points="80,50 75,40 85,50" fill="#654321" stroke="#000" stroke-width="1"/>
    <path d="M 65 55 Q 60 60 65 75" stroke="#654321" stroke-width="3" fill="none"/>
    <ellipse cx="160" cy="100" rx="15" ry="30" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="90" y="135" width="10" height="35" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="110" y="135" width="10" height="35" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="130" y="135" width="10" height="35" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="150" y="135" width="10" height="35" fill="#8b4513" stroke="#000" stroke-width="2"/>''',

    "house": '''<path d="M 50 90 L 100 40 L 150 90 L 150 160 L 50 160 Z" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <rect x="85" y="110" width="30" height="50" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="110" y="95" width="25" height="25" fill="#87ceeb" stroke="#000" stroke-width="2"/>
    <line x1="122.5" y1="95" x2="122.5" y2="120" stroke="#000" stroke-width="2"/>
    <line x1="110" y1="107.5" x2="135" y2="107.5" stroke="#000" stroke-width="2"/>
    <path d="M 45 90 L 100 35 L 155 90" stroke="#ff0000" stroke-width="5"/>''',

    "kitty": '''<circle cx="100" cy="110" r="35" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="80" r="28" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <polygon points="75,65 70,45 78,60" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <polygon points="125,65 130,45 122,60" fill="#ffa500" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="75" r="4" fill="#000"/>
    <circle cx="108" cy="75" r="4" fill="#000"/>
    <polygon points="100,83 96,87 104,87" fill="#ffb6c1"/>
    <path d="M 100 87 L 100 92" stroke="#000" stroke-width="2"/>
    <path d="M 75 85 L 60 82" stroke="#000" stroke-width="2"/>
    <path d="M 75 90 L 60 92" stroke="#000" stroke-width="2"/>
    <path d="M 125 85 L 140 82" stroke="#000" stroke-width="2"/>
    <path d="M 125 90 L 140 92" stroke="#000" stroke-width="2"/>
    <path d="M 85 95 Q 100 100 115 95" stroke="#000" stroke-width="2" fill="none"/>''',

    "leg": '''<rect x="85" y="50" width="30" height="120" rx="15" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <ellipse cx="100" cy="170" rx="20" ry="10" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <line x1="70" y1="80" x2="130" y2="80" stroke="#000" stroke-width="2" stroke-dasharray="3,3"/>''',

    "letter": '''<rect x="50" y="60" width="100" height="80" fill="#fff" stroke="#000" stroke-width="2"/>
    <line x1="60" y1="75" x2="140" y2="75" stroke="#4169e1" stroke-width="2"/>
    <line x1="60" y1="90" x2="140" y2="90" stroke="#4169e1" stroke-width="2"/>
    <line x1="60" y1="105" x2="120" y2="105" stroke="#4169e1" stroke-width="2"/>
    <path d="M 50 60 L 100 100 L 150 60" fill="none" stroke="#000" stroke-width="2"/>
    <path d="M 50 60 L 100 100" fill="#fff" opacity="0.7" stroke="#000" stroke-width="2"/>
    <path d="M 150 60 L 100 100" fill="#fff" opacity="0.7" stroke="#000" stroke-width="2"/>''',

    "man": '''<circle cx="100" cy="55" r="22" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="93" cy="52" r="3" fill="#000"/>
    <circle cx="107" cy="52" r="3" fill="#000"/>
    <path d="M 92 63 Q 100 67 108 63" stroke="#000" stroke-width="2" fill="none"/>
    <rect x="78" y="82" width="44" height="48" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <rect x="62" y="87" width="16" height="35" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <rect x="122" y="87" width="16" height="35" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <rect x="78" y="130" width="18" height="35" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="104" y="130" width="18" height="35" fill="#654321" stroke="#000" stroke-width="2"/>''',

    "men": '''<circle cx="70" cy="50" r="18" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="58" y="72" width="24" height="33" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <rect x="58" y="105" width="10" height="25" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <rect cx="72" y="105" width="10" height="25" fill="#2c5282" stroke="#000" stroke-width="2"/>
    <circle cx="130" cy="50" r="18" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="118" y="72" width="24" height="33" fill="#228b22" stroke="#000" stroke-width="2"/>
    <rect x="118" y="105" width="10" height="25" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="132" y="105" width="10" height="25" fill="#654321" stroke="#000" stroke-width="2"/>''',

    "milk": '''<path d="M 80 50 L 75 90 L 75 150 L 125 150 L 125 90 L 120 50 Z" fill="#fff" stroke="#000" stroke-width="2"/>
    <rect x="75" y="45" width="50" height="10" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <ellipse cx="100" cy="45" rx="25" ry="5" fill="#ff0000" stroke="#000" stroke-width="1"/>
    <rect x="85" y="65" width="30" height="25" fill="#fff" stroke="#4169e1" stroke-width="2"/>
    <text x="100" y="82" font-size="16" fill="#4169e1" text-anchor="middle" font-weight="bold">MILK</text>''',

    "money": '''<circle cx="100" cy="100" r="45" fill="#228b22" stroke="#006400" stroke-width="3"/>
    <text x="100" y="115" font-size="40" fill="#006400" text-anchor="middle" font-weight="bold">$</text>
    <circle cx="100" cy="100" r="35" fill="none" stroke="#006400" stroke-width="2"/>''',

    "morning": '''<circle cx="140" cy="60" r="25" fill="#ffff00" stroke="#ffa500" stroke-width="2"/>
    <line x1="140" y1="25" x2="140" y2="35" stroke="#ffa500" stroke-width="2"/>
    <line x1="165" y1="35" x2="158" y2="42" stroke="#ffa500" stroke-width="2"/>
    <line x1="175" y1="60" x2="165" y2="60" stroke="#ffa500" stroke-width="2"/>
    <rect x="40" y="130" width="120" height="40" fill="#87ceeb" stroke="#4169e1" stroke-width="2"/>
    <path d="M 40 140 Q 60 120 80 140 Q 100 120 120 140 Q 140 120 160 140" stroke="#fff" stroke-width="3" fill="none"/>''',

    "mother": '''<circle cx="100" cy="55" r="22" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="93" cy="52" r="3" fill="#000"/>
    <circle cx="107" cy="52" r="3" fill="#000"/>
    <path d="M 92 63 Q 100 67 108 63" stroke="#000" stroke-width="2" fill="none"/>
    <circle cx="85" cy="45" r="10" fill="#654321"/>
    <circle cx="115" cy="45" r="10" fill="#654321"/>
    <path d="M 70 85 L 60 135 L 70 135 L 78 95" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <path d="M 130 85 L 140 135 L 130 135 L 122 95" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <path d="M 78 85 Q 100 80 122 85 Q 100 115 78 85" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <rect x="85" y="135" width="12" height="30" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="103" y="135" width="12" height="30" fill="#ffd4a3" stroke="#000" stroke-width="2"/>''',

    "name": '''<rect x="50" y="70" width="100" height="60" fill="#fff" stroke="#000" stroke-width="2"/>
    <line x1="60" y1="90" x2="140" y2="90" stroke="#000" stroke-width="2"/>
    <text x="100" y="115" font-size="20" fill="#000" text-anchor="middle" font-weight="bold">NAME</text>''',

    "nest": '''<ellipse cx="100" cy="120" rx="50" ry="20" fill="#8b4513" stroke="#654321" stroke-width="2"/>
    <path d="M 60 120 Q 65 100 70 105 Q 75 95 80 105 Q 85 95 90 105 Q 95 95 100 105 Q 105 95 110 105 Q 115 95 120 105 Q 125 95 130 105 Q 135 100 140 120" stroke="#654321" stroke-width="2" fill="none"/>
    <circle cx="90" cy="110" r="8" fill="#e6f3ff" stroke="#000" stroke-width="1"/>
    <circle cx="105" cy="110" r="8" fill="#e6f3ff" stroke="#000" stroke-width="1"/>
    <circle cx="97.5" cy="102" r="8" fill="#e6f3ff" stroke="#000" stroke-width="1"/>''',

    "night": '''<rect x="30" y="30" width="140" height="140" fill="#000033" stroke="#000" stroke-width="2"/>
    <circle cx="130" cy="70" r="20" fill="#ffff00" stroke="#ffd700" stroke-width="2"/>
    <circle cx="138" cy="68" r="18" fill="#000033"/>
    <circle cx="60" cy="60" r="2" fill="#fff"/>
    <circle cx="75" cy="50" r="2" fill="#fff"/>
    <circle cx="90" cy="55" r="2" fill="#fff"/>
    <circle cx="50" cy="80" r="2" fill="#fff"/>
    <circle cx="70" cy="90" r="2" fill="#fff"/>
    <circle cx="85" cy="85" r="2" fill="#fff"/>
    <circle cx="100" cy="75" r="2" fill="#fff"/>
    <circle cx="55" cy="110" r="2" fill="#fff"/>
    <circle cx="75" cy="120" r="2" fill="#fff"/>''',

    "paper": '''<rect x="60" y="40" width="80" height="120" fill="#fff" stroke="#000" stroke-width="2"/>
    <path d="M 140 40 L 140 65 L 115 65 L 140 40" fill="#e0e0e0" stroke="#000" stroke-width="2"/>
    <line x1="70" y1="80" x2="130" y2="80" stroke="#4169e1" stroke-width="2"/>
    <line x1="70" y1="95" x2="130" y2="95" stroke="#4169e1" stroke-width="2"/>
    <line x1="70" y1="110" x2="130" y2="110" stroke="#4169e1" stroke-width="2"/>
    <line x1="70" y1="125" x2="110" y2="125" stroke="#4169e1" stroke-width="2"/>''',

    "party": '''<polygon points="80,80 70,110 90,110" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <polygon points="120,70 110,100 130,100" fill="#4169e1" stroke="#000" stroke-width="2"/>
    <circle cx="60" cy="90" r="6" fill="#ff0000"/>
    <circle cx="140" cy="85" r="6" fill="#ffff00"/>
    <path d="M 50 60 Q 60 40 70 60" stroke="#ff69b4" stroke-width="3" fill="none"/>
    <path d="M 130 55 Q 140 35 150 55" stroke="#4169e1" stroke-width="3" fill="none"/>
    <rect x="40" y="140" width="120" height="20" fill="#ffd700" stroke="#000" stroke-width="2"/>
    <circle cx="55" cy="130" r="4" fill="#ff0000"/>
    <circle cx="70" cy="125" r="4" fill="#00ff00"/>
    <circle cx="85" cy="130" r="4" fill="#0000ff"/>
    <circle cx="100" cy="125" r="4" fill="#ffff00"/>
    <circle cx="115" cy="130" r="4" fill="#ff00ff"/>
    <circle cx="130" cy="125" r="4" fill="#00ffff"/>
    <circle cx="145" cy="130" r="4" fill="#ffa500"/>''',

    "picture": '''<rect x="50" y="50" width="100" height="80" fill="#ffd700" stroke="#8b4513" stroke-width="6"/>
    <circle cx="130" cy="75" r="12" fill="#ffff00" stroke="#ffa500" stroke-width="2"/>
    <path d="M 60 110 L 80 90 L 100 105 L 125 80 L 140 95 L 140 120 L 60 120 Z" fill="#228b22" stroke="#006400" stroke-width="2"/>
    <polygon points="100,85 95,95 105,95" fill="#8b4513" stroke="#654321" stroke-width="1"/>''',

    "pig": '''<ellipse cx="100" cy="110" rx="50" ry="35" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <circle cx="80" cy="90" r="25" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <circle cx="75" cy="85" r="5" fill="#000"/>
    <circle cx="85" cy="85" r="5" fill="#000"/>
    <ellipse cx="80" cy="100" rx="12" ry="10" fill="#ff69b4"/>
    <ellipse cx="74" cy="98" rx="4" ry="5" fill="#000"/>
    <ellipse cx="86" cy="98" rx="4" ry="5" fill="#000"/>
    <ellipse cx="60" cy="75" rx="8" ry="12" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <ellipse cx="100" cy="75" rx="8" ry="12" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <rect x="60" y="135" width="12" height="25" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <rect x="85" y="135" width="12" height="25" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <rect x="110" y="135" width="12" height="25" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <rect x="135" y="135" width="12" height="25" fill="#ffb6c1" stroke="#000" stroke-width="2"/>
    <path d="M 145 105 Q 160 100 155 115" stroke="#ffb6c1" stroke-width="4" fill="none"/>''',

    "rabbit": '''<ellipse cx="100" cy="120" rx="35" ry="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="80" r="25" fill="#fff" stroke="#000" stroke-width="2"/>
    <ellipse cx="85" cy="40" rx="10" ry="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <ellipse cx="115" cy="40" rx="10" ry="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <ellipse cx="85" cy="50" rx="6" ry="18" fill="#ffb6c1"/>
    <ellipse cx="115" cy="50" rx="6" ry="18" fill="#ffb6c1"/>
    <circle cx="93" cy="75" r="4" fill="#000"/>
    <circle cx="107" cy="75" r="4" fill="#000"/>
    <polygon points="100,85 97,88 103,88" fill="#ffb6c1"/>
    <circle cx="145" cy="125" r="12" fill="#fff" stroke="#000" stroke-width="2"/>
    <rect x="85" y="145" width="12" height="20" fill="#fff" stroke="#000" stroke-width="2"/>
    <rect x="103" y="145" width="12" height="20" fill="#fff" stroke="#000" stroke-width="2"/>''',

    "rain": '''<ellipse cx="80" cy="60" rx="25" ry="20" fill="#b0c4de" stroke="#778899" stroke-width="2"/>
    <ellipse cx="110" cy="55" rx="30" ry="20" fill="#b0c4de" stroke="#778899" stroke-width="2"/>
    <ellipse cx="100" cy="70" rx="35" ry="22" fill="#b0c4de" stroke="#778899" stroke-width="2"/>
    <line x1="70" y1="90" x2="65" y2="110" stroke="#4169e1" stroke-width="3"/>
    <line x1="85" y1="95" x2="80" y2="120" stroke="#4169e1" stroke-width="3"/>
    <line x1="100" y1="95" x2="95" y2="115" stroke="#4169e1" stroke-width="3"/>
    <line x1="115" y1="90" x2="110" y2="120" stroke="#4169e1" stroke-width="3"/>
    <line x1="130" y1="85" x2="125" y2="110" stroke="#4169e1" stroke-width="3"/>''',

    "ring": '''<circle cx="100" cy="100" r="40" fill="none" stroke="#ffd700" stroke-width="8"/>
    <ellipse cx="100" cy="70" rx="15" ry="10" fill="#ff0000" stroke="#8b0000" stroke-width="2"/>
    <rect x="95" y="68" width="10" height="25" fill="#ffd700" stroke="#daa520" stroke-width="1"/>
    <ellipse cx="110" cy="75" rx="8" ry="5" fill="#fff" opacity="0.6"/>''',

    "robin": '''<circle cx="100" cy="95" r="30" fill="#ff4500" stroke="#000" stroke-width="2"/>
    <circle cx="90" cy="75" r="18" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="86" cy="72" r="4" fill="#000"/>
    <path d="M 78 75 L 70 73 L 78 71" fill="#ffa500" stroke="#000" stroke-width="1"/>
    <path d="M 130 85 L 155 75 L 160 85 L 155 95 L 130 85" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <path d="M 100 120 L 90 145 L 85 145 L 95 125" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <path d="M 105 120 L 115 145 L 120 145 L 110 125" fill="#8b4513" stroke="#000" stroke-width="2"/>''',

    "santa": '''<circle cx="100" cy="85" r="35" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="80" r="4" fill="#4169e1"/>
    <circle cx="108" cy="80" r="4" fill="#4169e1"/>
    <path d="M 90 95 Q 100 100 110 95" stroke="#000" stroke-width="2" fill="none"/>
    <ellipse cx="100" cy="115" rx="25" ry="15" fill="#fff" stroke="#000" stroke-width="2"/>
    <path d="M 70 65 L 65 45 L 135 45 L 130 65" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <ellipse cx="100" cy="45" rx="35" ry="8" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="35" r="8" fill="#fff" stroke="#000" stroke-width="1"/>
    <rect x="75" y="120" width="50" height="45" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <circle cx="85" cy="135" r="4" fill="#fff"/>
    <circle cx="85" cy="147" r="4" fill="#fff"/>
    <circle cx="85" cy="159" r="4" fill="#fff"/>
    <rect x="60" y="65" width="80" height="8" fill="#fff" stroke="#000" stroke-width="1"/>''',

    "school": '''<rect x="50" y="80" width="100" height="80" fill="#ff6347" stroke="#000" stroke-width="2"/>
    <path d="M 40 80 L 100 40 L 160 80" fill="#8b0000" stroke="#000" stroke-width="2"/>
    <rect x="85" y="110" width="30" height="50" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="60" y="95" width="20" height="20" fill="#87ceeb" stroke="#000" stroke-width="2"/>
    <line x1="70" y1="95" x2="70" y2="115" stroke="#000" stroke-width="2"/>
    <line x1="60" y1="105" x2="80" y2="105" stroke="#000" stroke-width="2"/>
    <rect x="120" y="95" width="20" height="20" fill="#87ceeb" stroke="#000" stroke-width="2"/>
    <line x1="130" y1="95" x2="130" y2="115" stroke="#000" stroke-width="2"/>
    <line x1="120" y1="105" x2="140" y2="105" stroke="#000" stroke-width="2"/>
    <rect x="95" y="55" width="10" height="25" fill="#8b4513" stroke="#000" stroke-width="1"/>
    <circle cx="100" cy="55" r="6" fill="#ffd700" stroke="#000" stroke-width="1"/>''',

    "seed": '''<ellipse cx="100" cy="100" rx="20" ry="30" fill="#8b4513" stroke="#654321" stroke-width="2"/>
    <path d="M 100 70 Q 95 60 100 55" stroke="#228b22" stroke-width="2" fill="none"/>
    <ellipse cx="92" cy="58" rx="6" ry="10" fill="#228b22" stroke="#006400" stroke-width="1"/>''',

    "sheep": '''<ellipse cx="100" cy="105" rx="45" ry="30" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="80" cy="85" r="20" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="75" cy="82" r="15" fill="#000"/>
    <circle cx="72" cy="80" r="3" fill="#fff"/>
    <circle cx="85" cy="82" r="15" fill="#000"/>
    <circle cx="82" cy="80" r="3" fill="#fff"/>
    <circle cx="60" cy="95" r="12" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="95" r="12" fill="#fff" stroke="#000" stroke-width="2"/>
    <circle cx="120" cy="100" r="12" fill="#fff" stroke="#000" stroke-width="2"/>
    <rect x="70" y="130" width="10" height="30" fill="#000"/>
    <rect x="90" y="130" width="10" height="30" fill="#000"/>
    <rect x="110" y="130" width="10" height="30" fill="#000"/>
    <rect x="130" y="130" width="10" height="30" fill="#000"/>''',

    "shoe": '''<ellipse cx="100" cy="130" rx="50" ry="20" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <path d="M 50 130 Q 50 100 70 90 L 110 90 L 110 130" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <ellipse cx="110" cy="90" rx="10" ry="8" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <line x1="75" y1="95" x2="75" y2="125" stroke="#654321" stroke-width="2"/>
    <line x1="85" y1="95" x2="85" y2="125" stroke="#654321" stroke-width="2"/>
    <line x1="95" y1="95" x2="95" y2="125" stroke="#654321" stroke-width="2"/>
    <line x1="105" y1="95" x2="105" y2="125" stroke="#654321" stroke-width="2"/>''',

    "sister": '''<circle cx="100" cy="60" r="22" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <circle cx="93" cy="55" r="3" fill="#000"/>
    <circle cx="107" cy="55" r="3" fill="#000"/>
    <path d="M 90 66 Q 100 70 110 66" stroke="#000" stroke-width="2" fill="none"/>
    <circle cx="82" cy="50" r="10" fill="#654321"/>
    <circle cx="118" cy="50" r="10" fill="#654321"/>
    <path d="M 75 88 L 62 133 L 72 133 L 80 98" fill="#9370db" stroke="#000" stroke-width="2"/>
    <path d="M 125 88 L 138 133 L 128 133 L 120 98" fill="#9370db" stroke="#000" stroke-width="2"/>
    <path d="M 80 88 Q 100 83 120 88 Q 100 113 80 88" fill="#9370db" stroke="#000" stroke-width="2"/>
    <rect x="85" y="133" width="12" height="27" fill="#ffd4a3" stroke="#000" stroke-width="2"/>
    <rect x="103" y="133" width="12" height="27" fill="#ffd4a3" stroke="#000" stroke-width="2"/>''',

    "snow": '''<circle cx="70" cy="60" r="8" fill="#fff" stroke="#b0c4de" stroke-width="2"/>
    <line x1="70" y1="52" x2="70" y2="68" stroke="#b0c4de" stroke-width="2"/>
    <line x1="62" y1="60" x2="78" y2="60" stroke="#b0c4de" stroke-width="2"/>
    <line x1="64" y1="54" x2="76" y2="66" stroke="#b0c4de" stroke-width="2"/>
    <line x1="76" y1="54" x2="64" y2="66" stroke="#b0c4de" stroke-width="2"/>
    <circle cx="120" cy="80" r="8" fill="#fff" stroke="#b0c4de" stroke-width="2"/>
    <line x1="120" y1="72" x2="120" y2="88" stroke="#b0c4de" stroke-width="2"/>
    <line x1="112" y1="80" x2="128" y2="80" stroke="#b0c4de" stroke-width="2"/>
    <line x1="114" y1="74" x2="126" y2="86" stroke="#b0c4de" stroke-width="2"/>
    <line x1="126" y1="74" x2="114" y2="86" stroke="#b0c4de" stroke-width="2"/>
    <circle cx="90" cy="110" r="8" fill="#fff" stroke="#b0c4de" stroke-width="2"/>
    <line x1="90" y1="102" x2="90" y2="118" stroke="#b0c4de" stroke-width="2"/>
    <line x1="82" y1="110" x2="98" y2="110" stroke="#b0c4de" stroke-width="2"/>
    <line x1="84" y1="104" x2="96" y2="116" stroke="#b0c4de" stroke-width="2"/>
    <line x1="96" y1="104" x2="84" y2="116" stroke="#b0c4de" stroke-width="2"/>
    <circle cx="130" cy="130" r="8" fill="#fff" stroke="#b0c4de" stroke-width="2"/>
    <line x1="130" y1="122" x2="130" y2="138" stroke="#b0c4de" stroke-width="2"/>
    <line x1="122" y1="130" x2="138" y2="130" stroke="#b0c4de" stroke-width="2"/>
    <line x1="124" y1="124" x2="136" y2="136" stroke="#b0c4de" stroke-width="2"/>
    <line x1="136" y1="124" x2="124" y2="136" stroke="#b0c4de" stroke-width="2"/>''',

    "song": '''<line x1="60" y1="140" x2="60" y2="160" stroke="#000" stroke-width="2"/>
    <line x1="60" y1="160" x2="140" y2="160" stroke="#000" stroke-width="2"/>
    <line x1="80" y1="140" x2="80" y2="160" stroke="#000" stroke-width="2"/>
    <line x1="100" y1="140" x2="100" y2="160" stroke="#000" stroke-width="2"/>
    <line x1="120" y1="140" x2="120" y2="160" stroke="#000" stroke-width="2"/>
    <line x1="140" y1="140" x2="140" y2="160" stroke="#000" stroke-width="2"/>
    <ellipse cx="55" cy="110" rx="8" ry="6" fill="#000"/>
    <rect x="63" y="70" width="3" height="40" fill="#000"/>
    <ellipse cx="75" cy="120" rx="8" ry="6" fill="#000"/>
    <rect x="83" y="90" width="3" height="30" fill="#000"/>
    <circle cx="100" cy="95" r="5" fill="#4169e1"/>
    <path d="M 70 80 Q 90 70 110 80" stroke="#000" stroke-width="2" fill="none"/>''',

    "squirrel": '''<ellipse cx="110" cy="110" rx="30" ry="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="85" cy="90" r="18" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <circle cx="80" cy="87" r="4" fill="#000"/>
    <ellipse cx="75" cy="82" rx="6" ry="10" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <ellipse cx="90" cy="82" rx="6" ry="10" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <path d="M 140 85 Q 165 60 170 90 Q 168 110 155 115 Q 145 108 140 100" fill="#654321" stroke="#000" stroke-width="2"/>
    <rect x="85" y="130" width="10" height="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="110" y="130" width="10" height="25" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <ellipse cx="95" cy="100" rx="6" ry="10" fill="#d2691e"/>''',

    "stick": '''<rect x="90" y="40" width="20" height="130" rx="10" fill="#8b4513" stroke="#654321" stroke-width="2"/>
    <ellipse cx="100" cy="60" rx="8" ry="15" fill="#a0522d"/>
    <ellipse cx="100" cy="90" rx="6" ry="12" fill="#a0522d"/>
    <ellipse cx="100" cy="120" rx="7" ry="14" fill="#a0522d"/>''',

    "street": '''<rect x="30" y="100" width="140" height="70" fill="#696969" stroke="#000" stroke-width="2"/>
    <rect x="85" y="110" width="30" height="55" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <line x1="100" y1="110" x2="100" y2="165" stroke="#000" stroke-width="3"/>
    <rect x="40" y="120" width="30" height="3" fill="#fff"/>
    <rect x="40" y="145" width="30" height="3" fill="#fff"/>
    <rect x="130" y="120" width="30" height="3" fill="#fff"/>
    <rect x="130" y="145" width="30" height="3" fill="#fff"/>''',

    "sun": '''<circle cx="100" cy="100" r="35" fill="#ffff00" stroke="#ffa500" stroke-width="2"/>
    <line x1="100" y1="40" x2="100" y2="55" stroke="#ffa500" stroke-width="4"/>
    <line x1="100" y1="145" x2="100" y2="160" stroke="#ffa500" stroke-width="4"/>
    <line x1="40" y1="100" x2="55" y2="100" stroke="#ffa500" stroke-width="4"/>
    <line x1="145" y1="100" x2="160" y2="100" stroke="#ffa500" stroke-width="4"/>
    <line x1="55" y1="55" x2="65" y2="65" stroke="#ffa500" stroke-width="4"/>
    <line x1="135" y1="65" x2="145" y2="55" stroke="#ffa500" stroke-width="4"/>
    <line x1="55" y1="145" x2="65" y2="135" stroke="#ffa500" stroke-width="4"/>
    <line x1="135" y1="135" x2="145" y2="145" stroke="#ffa500" stroke-width="4"/>''',

    "table": '''<rect x="40" y="90" width="120" height="15" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="45" y="105" width="10" height="60" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="145" y="105" width="10" height="60" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="85" y="105" width="10" height="35" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <rect x="105" y="105" width="10" height="35" fill="#8b4513" stroke="#000" stroke-width="2"/>''',

    "thing": '''<circle cx="100" cy="100" r="45" fill="#9370db" stroke="#000" stroke-width="3"/>
    <text x="100" y="115" font-size="30" fill="#fff" text-anchor="middle" font-weight="bold">?</text>''',

    "time": '''<circle cx="100" cy="100" r="50" fill="#fff" stroke="#000" stroke-width="3"/>
    <circle cx="100" cy="100" r="5" fill="#000"/>
    <line x1="100" y1="100" x2="100" y2="65" stroke="#000" stroke-width="3"/>
    <line x1="100" y1="100" x2="125" y2="100" stroke="#000" stroke-width="3"/>
    <text x="100" y="60" font-size="16" fill="#000" text-anchor="middle">12</text>
    <text x="140" y="105" font-size="16" fill="#000" text-anchor="middle">3</text>
    <text x="100" y="150" font-size="16" fill="#000" text-anchor="middle">6</text>
    <text x="60" y="105" font-size="16" fill="#000" text-anchor="middle">9</text>''',

    "top": '''<polygon points="100,40 70,80 130,80" fill="#ff0000" stroke="#000" stroke-width="2"/>
    <rect x="95" y="75" width="10" height="15" fill="#ffff00" stroke="#000" stroke-width="2"/>
    <ellipse cx="100" cy="90" rx="30" ry="10" fill="#0000ff" stroke="#000" stroke-width="2"/>
    <line x1="70" y1="100" x2="130" y2="120" stroke="#000" stroke-width="2" opacity="0.3"/>''',

    "toy": '''<rect x="70" y="90" width="60" height="50" fill="#ff6347" stroke="#000" stroke-width="2"/>
    <circle cx="80" cy="145" r="10" fill="#333" stroke="#000" stroke-width="2"/>
    <circle cx="120" cy="145" r="10" fill="#333" stroke="#000" stroke-width="2"/>
    <rect x="85" y="70" width="30" height="25" fill="#ff6347" stroke="#000" stroke-width="2"/>
    <circle cx="92" cy="80" r="4" fill="#fff"/>
    <circle cx="108" cy="80" r="4" fill="#fff"/>
    <path d="M 95 88 Q 100 91 105 88" stroke="#000" stroke-width="2" fill="none"/>''',

    "tree": '''<rect x="90" y="100" width="20" height="60" fill="#8b4513" stroke="#000" stroke-width="2"/>
    <polygon points="100,40 70,75 85,75 60,100 140,100 115,75 130,75" fill="#228b22" stroke="#000" stroke-width="2"/>
    <circle cx="85" cy="80" r="4" fill="#ff0000"/>
    <circle cx="110" cy="85" r="4" fill="#ff0000"/>''',

    "watch": '''<circle cx="100" cy="110" r="35" fill="#333" stroke="#000" stroke-width="3"/>
    <circle cx="100" cy="110" r="30" fill="#fff" stroke="#000" stroke-width="1"/>
    <line x1="100" y1="110" x2="100" y2="90" stroke="#000" stroke-width="2"/>
    <line x1="100" y1="110" x2="115" y2="115" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="110" r="3" fill="#000"/>
    <rect x="70" y="108" width="20" height="4" fill="#333" stroke="#000" stroke-width="1"/>
    <rect x="110" y="108" width="20" height="4" fill="#333" stroke="#000" stroke-width="1"/>''',

    "water": '''<rect x="40" y="90" width="120" height="80" fill="#87ceeb" stroke="#4169e1" stroke-width="2"/>
    <path d="M 40 100 Q 60 95 80 100 Q 100 105 120 100 Q 140 95 160 100" stroke="#4169e1" stroke-width="2" fill="none"/>
    <path d="M 40 115 Q 60 110 80 115 Q 100 120 120 115 Q 140 110 160 115" stroke="#4169e1" stroke-width="2" fill="none"/>
    <path d="M 40 130 Q 60 125 80 130 Q 100 135 120 130 Q 140 125 160 130" stroke="#4169e1" stroke-width="2" fill="none"/>
    <ellipse cx="70" cy="105" rx="6" ry="10" fill="#fff" opacity="0.4"/>''',

    "way": '''<path d="M 50 50 L 100 100 L 150 50" fill="none" stroke="#4169e1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 100 100 L 100 160" fill="none" stroke="#4169e1" stroke-width="8" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="8" fill="#4169e1"/>
    <circle cx="150" cy="50" r="8" fill="#4169e1"/>
    <circle cx="100" cy="160" r="8" fill="#4169e1"/>''',

    "wind": '''<path d="M 40 80 Q 80 70 100 80 Q 120 90 140 80" stroke="#87ceeb" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="145" cy="80" r="8" fill="none" stroke="#87ceeb" stroke-width="3"/>
    <path d="M 50 110 Q 90 100 110 110 Q 130 120 150 110" stroke="#87ceeb" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="155" cy="110" r="8" fill="none" stroke="#87ceeb" stroke-width="3"/>
    <path d="M 60 140 Q 90 130 110 140 Q 125 148 135 140" stroke="#87ceeb" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="140" cy="140" r="8" fill="none" stroke="#87ceeb" stroke-width="3"/>''',

    "window": '''<rect x="50" y="50" width="100" height="100" fill="#87ceeb" stroke="#8b4513" stroke-width="6"/>
    <line x1="50" y1="100" x2="150" y2="100" stroke="#8b4513" stroke-width="6"/>
    <line x1="100" y1="50" x2="100" y2="150" stroke="#8b4513" stroke-width="6"/>
    <ellipse cx="70" cy="70" rx="12" ry="18" fill="#fff" opacity="0.5"/>
    <ellipse cx="130" cy="130" rx="12" ry="18" fill="#fff" opacity="0.5"/>''',

    "wood": '''<rect x="50" y="80" width="100" height="80" fill="#8b4513" stroke="#654321" stroke-width="2"/>
    <ellipse cx="80" cy="110" rx="15" ry="10" fill="#654321" opacity="0.5"/>
    <ellipse cx="120" cy="130" rx="12" ry="8" fill="#654321" opacity="0.5"/>
    <path d="M 60 90 Q 65 110 60 130" stroke="#654321" stroke-width="1" fill="none"/>
    <path d="M 70 85 Q 75 120 70 155" stroke="#654321" stroke-width="1" fill="none"/>
    <path d="M 90 85 Q 95 115 90 155" stroke="#654321" stroke-width="1" fill="none"/>
    <path d="M 110 85 Q 105 120 110 155" stroke="#654321" stroke-width="1" fill="none"/>
    <path d="M 130 90 Q 125 115 130 145" stroke="#654321" stroke-width="1" fill="none"/>''',

    # 5 additional common nouns to make 100
    "book": '''<rect x="60" y="50" width="80" height="110" fill="#4169e1" stroke="#000" stroke-width="3"/>
    <rect x="65" y="50" width="10" height="110" fill="#2c5282"/>
    <line x1="70" y1="60" x2="70" y2="150" stroke="#fff" stroke-width="1" stroke-dasharray="5,5"/>
    <text x="100" y="110" font-size="24" fill="#fff" text-anchor="middle" font-weight="bold">ABC</text>''',

    "star": '''<polygon points="100,40 115,85 165,85 125,115 140,160 100,130 60,160 75,115 35,85 85,85" fill="#ffff00" stroke="#ffa500" stroke-width="2"/>
    <circle cx="100" cy="100" r="20" fill="#fff" opacity="0.3"/>''',

    "moon": '''<circle cx="100" cy="100" r="50" fill="#ffff00" stroke="#ffd700" stroke-width="2"/>
    <circle cx="120" cy="90" r="45" fill="#000033"/>
    <circle cx="85" cy="85" r="8" fill="#d3d3d3" opacity="0.6"/>
    <circle cx="95" cy="110" r="12" fill="#d3d3d3" opacity="0.5"/>
    <circle cx="75" cy="120" r="6" fill="#d3d3d3" opacity="0.4"/>''',

    "kite": '''<path d="M 100 40 L 140 100 L 100 130 L 60 100 Z" fill="#ff69b4" stroke="#000" stroke-width="2"/>
    <line x1="60" y1="100" x2="140" y2="100" stroke="#000" stroke-width="2"/>
    <line x1="100" y1="40" x2="100" y2="130" stroke="#000" stroke-width="2"/>
    <path d="M 100 130 L 95 160 L 90 155 M 95 160 L 85 180 L 80 175 M 85 180 L 80 195" stroke="#4169e1" stroke-width="2" fill="none"/>
    <rect x="85" y="168" width="8" height="8" fill="#ff0000"/>
    <rect x="75" y="188" width="8" height="8" fill="#ffff00"/>''',

    "bell": '''<path d="M 100 50 L 70 120 L 130 120 Z" fill="#ffd700" stroke="#000" stroke-width="2"/>
    <circle cx="100" cy="30" r="8" fill="#ffd700" stroke="#000" stroke-width="2"/>
    <rect x="98" y="30" width="4" height="20" fill="#000"/>
    <circle cx="100" cy="130" r="8" fill="#000"/>
    <path d="M 70 120 Q 100 125 130 120" stroke="#000" stroke-width="1" fill="none"/>''',
}

def generate_all_svgs():
    """Generate all SVG files"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    count = 0
    for noun, svg_content in NOUN_SVGS.items():
        svg = create_svg(svg_content)
        filepath = os.path.join(OUTPUT_DIR, f"{noun}.svg")
        with open(filepath, 'w') as f:
            f.write(svg)
        count += 1
        print(f"Created {filepath}")

    print(f"\nSuccessfully generated {count} SVG files in {OUTPUT_DIR}")

if __name__ == "__main__":
    generate_all_svgs()
