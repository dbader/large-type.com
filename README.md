# [large-type.com](http://large-type.com) – Display and share text in a large font, directly from your browser

Large-type.com is a utility website that lets you **display & share text in a very large font** directly from your browser.

That's handy whenever you need to **read something on your screen from further away**—for example, phone numbers and passwords.

Even better, when you share text with large-type.com **only the person with the link sees your text**. Rendering happens locally on your browser and your text is not transmitted to any servers.

![](twitter-card.png)

Here's a quick [demo video](https://www.youtube.com/watch?v=EHaH3dO1YH4).

## Word Image Cards Feature

Large-type.com now includes a **word image cards** feature that displays images when specific words are typed. This creates a fun, visual experience where images appear above the large text display.

### How It Works

When you type words in the input field, the application automatically:
1. **Detects words** - Splits your text by spaces to identify individual words
2. **Searches for matching images** - Looks in the `words/` directory for images matching those words
3. **Displays image cards** - Shows beautiful, animated cards at the top of the screen with the matching images
4. **Updates dynamically** - As you type, cards appear and disappear in real-time based on the current text

### Behavior Examples

- Type `DOG` → A dog image card appears
- Type `DOG CAT` → Both a dog card and a cat card appear
- Type `DOGN` → The dog card disappears (no longer matches)
- Type `BAT` then continue to `BATH` → The bat card is replaced by a bath card
- Type `CAT DOG` → Two cards appear side-by-side

### Adding Your Own Images

To add new word-image associations, simply add image files to the `words/` directory:

**Supported formats:** `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`

**Naming conventions:**

1. **Single image per word:**
   - `dog.png` - Shows when "DOG" is typed
   - `cat.jpg` - Shows when "CAT" is typed

2. **Multiple images per word** (random selection):
   - `dog.png` and `dog.jpg` - Randomly chooses one
   - `dog-1.svg` and `dog-2.svg` - Randomly chooses one
   - Can mix: `dog.png`, `dog-1.jpg`, `dog-2.svg` (all four options)

3. **Multi-word phrases:**
   - Currently supports space-separated words
   - Each word is matched independently
   - Example: typing "BIG DOG" shows two separate cards if `big.png` and `dog.png` exist

**Notes:**
- Word matching is **case-insensitive** (DOG, dog, Dog all match `dog.png`)
- The system checks for up to 10 numbered variations (`word-1` through `word-10`)
- Images are randomly selected from available matches each time
- Failed image loads are automatically hidden

### Current Example Words

The repository includes example images for:
- `dog` (with multiple variations)
- `cat`
- `bat`
- `bath`

Try typing these words to see the feature in action!

## FAQs

### What can I use it for?
Here are some ideas:

* Read that phone number from across the room?
    * [large-type.com/#(555)-123-456](http://large-type.com/#(555)-123-456)
* Co-worker needs to know your IP address?
    * [large-type.com/#192.168.1.23](http://large-type.com/#192.168.1.23)
* Show your friend the WiFi password?
    * [large-type.com/#P4$$w0rd](http://large-type.com/#P4%24%24w0rd)
* Important announcement on social media?
    * [large-type.com/##YOLO](http://large-type.com/#%23YOLO)
* Need a giant timer notification?
    * `$ sleep 10; open http://large-type.com/#Done!`
* Waiting for your code to compile?
    * `$ make; open http://large-type.com/#Done!`
* Embed it in your own apps?
    * `'http://large-type.com/#' + encodeURIComponent('Your Text Here')`
* Profess your love from a runaway train?
    * [large-type.com/#I❤️U](http://large-type.com/#I❤️U)

### How secure is it?

**The short answer**: Sharing text with someone by sending them a link to large-type.com offers the same level of security as sending them the text directly. Always use secure communication methods when sharing password URLs.

**The long answer**: When you share a link to large-type.com with someone and they open it in their browser, the text in the URL fragment won't be transmitted as part of the HTTP request. As per [RFC 2396](https://tools.ietf.org/html/rfc2396#section-4) browsers [don't send the URL fragment with the HTTP request](https://stackoverflow.com/questions/317760/how-to-get-url-hash-from-server-side).

> When a URI reference is used to perform a retrieval action on the identified resource, the optional fragment identifier, separated from the URI by a crosshatch ("#") character, consists of additional reference information **to be interpreted by the user agent after the retrieval action has been successfully completed**. As such, it is not part of a URI, but is often used in conjunction with a URI. (RFC 2396 section 4.1)

Large-type.com uses Google Analytics and Twitter widgets. Both do not report URL fragments to their backend servers.

All text formatting and rendering happen locally on your browser through CSS and JavaScript. Your text is not transmitted to any servers when the browser.

Additionally, large-type.com is fully open-source, small and hosted on GitHub Pages which means you can audit the source code to see that your data isn't sent or stored anywhere else.

Please keep in mind that, while large-type does not send the text to a backend server, large-type.com is not responsible for how you choose to share the URL. Please use secure communication methods when sharing password URLs.

### I found a bug! Now what?
Awesome! Please [create an issue](https://github.com/dbader/large-type.com/issues) on GitHub (and if you have a really good day maybe a pull request, too 😃) so we can fix it. Thanks!

### Local Development & Preview

Spin up a local development web server:

```
python -m http.server 8000
```

Then open http://localhost:8000/ to preview.

### Local Network Hosting

To host this application on your local network (LAN) so other computers can access it:

**Quick Start:**
```bash
# On Linux/Mac:
./start.sh

# On Windows:
start.bat

# Or directly with Python:
python3 start_server.py
```

The server will automatically:
- Start on port 8000
- Display your local network IP address
- Make the app accessible to other devices on the same network

**Example output:**
```
======================================================================
🚀 Fun-Type Server Started!
======================================================================

📱 Access from THIS computer:
   http://localhost:8000

🌐 Access from OTHER computers on your local network:
   http://192.168.1.100:8000

💡 Tips:
   - Make sure devices are on the same WiFi/network
   - Check firewall settings if connection fails
   - Press Ctrl+C to stop the server
======================================================================
```

**Troubleshooting:**
- Ensure all devices are on the same WiFi network
- Check firewall settings if other devices can't connect
- On Linux, you may need to allow port 8000 through the firewall
- Use the displayed IP address (not localhost) on other devices

## Meta
Design inspired by [1Password's](https://agilebits.com/onepassword) large-type feature.

Daniel Bader – [@dbader_org](https://twitter.com/dbader_org) – mail@dbader.org

[https://github.com/dbader/large-type.com](https://github.com/dbader/large-type.com)
