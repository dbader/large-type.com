window.addEventListener('DOMContentLoaded', function() {
    "use strict";

    var WELCOME_MSG = '*hello*';

    var mainDiv = document.querySelector('.main');
    var textDiv = document.querySelector('.text');
    var inputField = document.querySelector('.inputbox');
    var charboxTemplate = document.querySelector('#charbox-template');
    var defaultTitle = document.querySelector("title").innerText;
    var renderTimeout = null;
    var lastRenderTime = 0;
    var renderThrottle = 16; // ms - ~60fps

    function updateFragment(text) {
        // Don't spam the browser history & strip query strings.
        window.location.replace(location.origin + '/#' + encodeURIComponent(text));
    }

    function updateTitle(text) {
        if (!text || text === WELCOME_MSG) {
            document.title = defaultTitle;
        } else {
            document.title = text;
        }
    }

    function clearChars() {
        while (textDiv.firstChild) {
            textDiv.removeChild(textDiv.firstChild);
        }
    }

    function isEmoji(seg) {
      if (window.Intl && window.Intl.Segmenter) {
        return seg.match(/\p{Emoji}\uFE0F|\p{Emoji_Presentation}/u);
      } else {
        return false;
      }
    }

    function renderText() {
        // Throttle rendering to improve typing performance while maintaining responsiveness
        var now = Date.now();
        var timeSinceLastRender = now - lastRenderTime;

        // Clear any pending render
        if (renderTimeout) {
            clearTimeout(renderTimeout);
            renderTimeout = null;
        }

        if (timeSinceLastRender >= renderThrottle) {
            // Enough time has passed, render immediately
            lastRenderTime = now;
            renderTextImmediate();
        } else {
            // Schedule render for the next available slot
            var delay = renderThrottle - timeSinceLastRender;
            renderTimeout = setTimeout(function() {
                lastRenderTime = Date.now();
                renderTextImmediate();
                renderTimeout = null;
            }, delay);
        }
    }

    function renderTextImmediate() {
        // Return a space as typing indicator if text is empty.
        var text = decodeURIComponent(location.hash.split('#')[1] || ' ');

        var textWidth = null;
        var forEachSegment = null;
        if (window.Intl && window.Intl.Segmenter) {
            // Emoji-friendly path -- needs Intl.Segmenter support
            var segmenter = new Intl.Segmenter();
            var segments = Array.from(segmenter.segment(text));
            forEachSegment = function forEachGraphemeSegment(f) {
                segments.forEach(function(seg) {
                    f.call(this, seg.segment, seg.index);
                });
            };

            textWidth = 0;
            forEachSegment(function(seg) {
                // Unicode.org specifies these properties as follows [1]:
                //  - `Emoji`: "characters that are emoji"
                //  - `Emoji_Presentation`: "characters that have emoji
                //    presentation by default"
                // Take for example '☺' (U+263A): this is a "legacy"
                // emoji that is not _presented_ as an emoji by default (but
                // rather as a monospace / monochrome pictograph). As such,
                // it does have propery `Emoji` but not `Emoji_Presentation`.
                // In order to present such "legacy" emojis as emojis, they
                // must be followed by U+FE0F (variation selector 16).
                // Contrast that with '😃' (U+1F603), which *is* presented
                // as an emoji by default, and as such has _both_ poperties.
                // (All browsers that support `Intl.Segmenter` also support
                // these Unicode property class escapes.)
                // [1]: https://unicode.org/reports/tr51/#Emoji_Properties
                if (isEmoji(seg)) {
                    textWidth += 1.65; // Roughly measured.
                } else {
                    textWidth += 1;
                }
            });
        } else {
            // Backward compatibility -- no Intl.Segmenter support
            textWidth = text.length;
            forEachSegment = function forEachCharSegment(f) {
                text.split(/.*?/u).forEach(f);
            };
        }

        // Calculate responsive font size with wrapping logic
        // Start with 200pt max, wrap at 32pt threshold, reduce below 32pt if vertical overflow
        var MAX_FONT_SIZE = 200;
        var WRAP_THRESHOLD = 32;
        var MIN_FONT_SIZE = 8;
        var viewportWidth = window.innerWidth;
        var viewportHeight = window.innerHeight;

        // Estimate character width at various font sizes (roughly 0.6em per character)
        var estimatedCharWidth = 0.6;
        var singleLineFontSize = Math.min((viewportWidth * 0.9) / (textWidth * estimatedCharWidth), MAX_FONT_SIZE);

        var fontSize = singleLineFontSize;
        var shouldWrap = false;

        // If single-line font size would be below wrap threshold, enable wrapping at threshold
        if (singleLineFontSize < WRAP_THRESHOLD) {
            fontSize = WRAP_THRESHOLD;
            shouldWrap = true;
        }

        // Render once with calculated font size
        renderCharsWithFontSize(fontSize, shouldWrap, forEachSegment, text);

        // Use binary search to find optimal font size if wrapping and overflow detected
        if (shouldWrap && checkVerticalOverflow()) {
            var minSize = MIN_FONT_SIZE;
            var maxSize = WRAP_THRESHOLD;
            var optimalSize = minSize;

            // Binary search for optimal font size (max 6 iterations instead of 20)
            while (maxSize - minSize > 1) {
                var midSize = Math.floor((minSize + maxSize) / 2);
                renderCharsWithFontSize(midSize, shouldWrap, forEachSegment, text);

                if (checkVerticalOverflow()) {
                    maxSize = midSize;
                } else {
                    minSize = midSize;
                    optimalSize = midSize;
                }
            }

            // Final render with optimal size
            if (fontSize !== optimalSize) {
                renderCharsWithFontSize(optimalSize, shouldWrap, forEachSegment, text);
            }
        }

        // Ignore the placeholder space (typing indicator).
        if (text === ' ') {
            text = '';
        }

        // Always keep cursor at the end of the text input
        if (inputField.value !== text) {
            inputField.value = text;
        }
        // Set cursor position to the end
        inputField.selectionStart = inputField.value.length;
        inputField.selectionEnd = inputField.value.length;
        updateFragment(text);
        updateTitle(text);

        // Update word image cards
        renderWordCards();
    }

    function renderCharsWithFontSize(fontSize, shouldWrap, forEachSegment, text) {
        clearChars();

        // No maxWidth constraint - let text wrap naturally at viewport edge
        textDiv.style.maxWidth = 'none';

        forEachSegment(function(seg) {
            var charbox = charboxTemplate.content.cloneNode(true);
            var charElem = charbox.querySelector('.char');
            charElem.style.fontSize = fontSize + 'pt';

            if (seg !== ' ') {
                charElem.textContent = applyLetterCase(seg);
            } else {
                charElem.innerHTML = '&nbsp;';
            }

            if (isEmoji(seg)) {
                charElem.className = 'emoji';
            } else if (seg.match(/[0-9]/i)) {
                charElem.className = 'number';
            } else if (!seg.match(/\p{L}/iu)) {
                charElem.className = 'symbol';
            }

            textDiv.appendChild(charbox);
        });
    }

    function checkVerticalOverflow() {
        var viewportHeight = window.innerHeight;
        var textRect = textDiv.getBoundingClientRect();
        // Add some padding for comfort
        return textRect.height > (viewportHeight * 0.8);
    }

    function onInput(evt) {
        updateFragment(evt.target.value);
    }

    // Word Image Cards Feature
    var wordCardsContainer = document.querySelector('.word-cards-container');
    var wordCardTemplate = document.querySelector('#word-card-template');
    var imageManifest = null; // Manifest loaded from server
    var currentWordCards = []; // Track currently displayed word cards

    // Color name to hex mapping
    var colorMap = {
        "red": "#FF0000",
        "blue": "#0000FF",
        "green": "#008000",
        "yellow": "#FFD700",
        "orange": "#FFA500",
        "purple": "#800080",
        "pink": "#FFC0CB",
        "brown": "#8B4513",
        "black": "#000000",
        "white": "#FFFFFF",
        "gray": "#808080",
        "grey": "#808080",
        "silver": "#C0C0C0",
        "gold": "#FFD700",
        "cyan": "#00FFFF",
        "magenta": "#FF00FF",
        "lime": "#00FF00",
        "navy": "#000080",
        "teal": "#008080",
        "aqua": "#00FFFF",
        "maroon": "#800000",
        "olive": "#808000",
        "violet": "#EE82EE",
        "indigo": "#4B0082",
        "turquoise": "#40E0D0",
        "tan": "#D2B48C",
        "beige": "#F5F5DC",
        "coral": "#FF7F50",
        "crimson": "#DC143C",
        "lavender": "#E6E6FA",
        "salmon": "#FA8072",
        "peach": "#FFDAB9"
    };

    // List of most common English words (top 1000)
    var commonWords = [
        // Articles, pronouns, conjunctions, prepositions (most common)
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
        "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
        "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
        "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
        "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
        "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
        "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
        "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
        "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
        "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",

        // Common verbs (present, past, gerund forms)
        "is", "was", "are", "been", "has", "had", "were", "said", "did", "having",
        "may", "should", "could", "being", "does", "doing", "would", "can", "made", "find",
        "tell", "ask", "work", "seem", "feel", "try", "leave", "call", "keep", "let",
        "begin", "start", "stop", "end", "turn", "put", "hold", "stay", "wait", "follow",
        "close", "walk", "run", "sit", "stand", "eat", "drink", "sleep", "wake", "read",
        "write", "speak", "listen", "hear", "smell", "touch", "feel", "think", "know", "understand",
        "remember", "forget", "learn", "teach", "answer", "help", "play", "buy", "sell", "give",
        "bring", "send", "love", "need", "show", "move", "live", "believe", "allow", "add",
        "meet", "include", "continue", "set", "learn", "change", "lead", "understand", "watch", "provide",
        "serve", "die", "send", "expect", "build", "stay", "fall", "cut", "reach", "kill",

        // Common nouns - people & body
        "man", "woman", "child", "boy", "girl", "family", "friend", "person", "life", "hand",
        "eye", "head", "face", "place", "door", "house", "room", "home", "world", "school",
        "mother", "father", "son", "daughter", "brother", "sister", "husband", "wife", "uncle", "aunt",
        "grandma", "grandpa", "grandmother", "grandfather", "baby", "kid", "teen", "teenager", "adult", "parent",
        "body", "arm", "leg", "foot", "feet", "finger", "toe", "ear", "nose", "mouth",
        "hair", "skin", "heart", "blood", "bone", "brain", "muscle", "tooth", "teeth", "tongue",

        // Occupations & titles
        "mr", "mrs", "miss", "ms", "doctor", "teacher", "student", "worker", "farmer", "cook",
        "driver", "nurse", "police", "officer", "soldier", "artist", "writer", "singer", "actor", "president",
        "king", "queen", "prince", "princess", "chief", "manager", "boss", "leader", "member", "owner",

        // Places & locations
        "city", "town", "village", "country", "state", "nation", "street", "park", "garden", "farm",
        "store", "shop", "market", "bank", "hospital", "church", "school", "library", "museum", "theater",
        "restaurant", "hotel", "office", "factory", "station", "airport", "port", "beach", "mountain", "river",
        "lake", "forest", "field", "island", "valley", "hill", "ocean", "desert", "sky", "cloud",
        "area", "building", "center", "point", "side", "top", "bottom", "north", "south", "east",
        "west", "corner", "edge", "middle", "end", "front", "road", "path", "yard", "ground",

        // Nature & weather
        "water", "food", "tree", "air", "fire", "sea", "sun", "moon", "star", "light",
        "rain", "snow", "wind", "storm", "ice", "weather", "season", "nature", "animal", "plant",
        "flower", "grass", "leaf", "wood", "stone", "rock", "dirt", "sand", "dust", "mud",

        // Animals
        "cat", "dog", "bird", "fish", "horse", "cow", "pig", "sheep", "chicken", "rabbit",
        "bear", "lion", "tiger", "elephant", "monkey", "snake", "frog", "bee", "fly", "ant",
        "mouse", "rat", "wolf", "fox", "deer", "duck", "goose", "turkey", "owl", "eagle",

        // Colors (all common colors)
        "red", "blue", "green", "black", "white", "yellow", "orange", "purple", "pink", "brown",
        "gray", "grey", "silver", "gold", "cyan", "magenta", "lime", "navy", "teal", "aqua",
        "maroon", "olive", "violet", "indigo", "turquoise", "tan", "beige", "coral", "crimson", "lavender",
        "salmon", "peach",

        // Numbers (spelled out - AP/NYT style: spell out one-nine, some spell out to ninety-nine)
        "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
        "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
        "hundred", "thousand", "million", "billion", "trillion",
        "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",

        // Time & calendar
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        "today", "yesterday", "tomorrow", "morning", "afternoon", "evening", "night", "day",
        "week", "month", "year", "hour", "minute", "second", "time", "clock",
        "january", "february", "march", "april", "may", "june", "july",
        "august", "september", "october", "november", "december",
        "spring", "summer", "fall", "autumn", "winter", "past", "present", "future",

        // Food & drink
        "fruit", "vegetable", "apple", "orange", "banana", "grape", "lemon", "strawberry", "cherry", "peach",
        "milk", "bread", "meat", "rice", "egg", "cheese", "butter", "salt", "sugar", "tea",
        "coffee", "juice", "soup", "cake", "cookie", "candy", "chocolate", "breakfast", "lunch", "dinner",
        "chicken", "beef", "pork", "fish", "pizza", "pasta", "salad", "sandwich", "potato", "tomato",

        // Objects & items
        "book", "pen", "paper", "desk", "chair", "table", "bed", "window", "wall", "floor",
        "plate", "cup", "bowl", "spoon", "fork", "knife", "bottle", "glass", "box", "bag",
        "car", "bus", "train", "plane", "ship", "boat", "bike", "bicycle", "truck", "vehicle",
        "shirt", "pants", "dress", "coat", "hat", "shoe", "sock", "glove", "belt", "watch",
        "ring", "key", "money", "dollar", "cent", "coin", "card", "gift", "toy", "game",
        "ball", "bat", "stick", "rope", "net", "flag", "sign", "tool", "wheel", "engine",

        // Technology & communication
        "phone", "computer", "tv", "television", "radio", "camera", "picture", "photo", "video", "music",
        "song", "movie", "film", "show", "program", "internet", "email", "message", "text", "call",
        "screen", "keyboard", "mouse", "button", "device", "machine", "system", "software", "app", "site",

        // Abstract concepts & communication
        "story", "news", "letter", "word", "sentence", "question", "answer", "number", "name", "title",
        "color", "shape", "size", "sound", "taste", "feeling", "idea", "thought", "dream", "hope",
        "wish", "plan", "problem", "solution", "reason", "way", "kind", "type", "part", "piece",
        "bit", "lot", "group", "team", "class", "club", "party", "meeting", "event", "game",
        "power", "fact", "truth", "law", "rule", "right", "order", "cause", "effect", "case",

        // Descriptive adjectives
        "big", "small", "long", "short", "tall", "high", "low", "wide", "narrow", "thick",
        "thin", "heavy", "light", "hard", "soft", "hot", "cold", "warm", "cool", "wet",
        "dry", "clean", "dirty", "new", "old", "young", "fresh", "strong", "weak", "loud",
        "quiet", "fast", "slow", "quick", "early", "late", "open", "closed", "full", "empty",
        "right", "wrong", "good", "bad", "great", "poor", "rich", "happy", "sad", "glad",
        "angry", "afraid", "brave", "careful", "safe", "dangerous", "easy", "difficult", "hard", "simple",
        "complex", "clear", "dark", "bright", "beautiful", "ugly", "pretty", "nice", "fine", "wonderful",
        "special", "different", "same", "similar", "equal", "common", "rare", "usual", "strange", "normal",

        // Adverbs & other descriptors
        "very", "too", "quite", "rather", "pretty", "fairly", "really", "truly", "sure", "certainly",
        "probably", "perhaps", "maybe", "almost", "nearly", "hardly", "barely", "only", "just", "still",
        "yet", "already", "soon", "never", "ever", "always", "often", "sometimes", "usually", "seldom",
        "here", "there", "where", "everywhere", "nowhere", "anywhere", "somewhere", "away", "around", "above",
        "below", "under", "over", "between", "among", "near", "far", "close", "next", "beyond",
        "forward", "backward", "inside", "outside", "up", "down", "left", "right", "straight", "across",

        // Action & state
        "happen", "become", "appear", "seem", "remain", "exist", "occur", "rise", "grow", "develop",
        "increase", "decrease", "improve", "reduce", "produce", "create", "destroy", "break", "fix", "repair",
        "open", "close", "push", "pull", "lift", "drop", "throw", "catch", "hit", "kick",
        "jump", "climb", "swim", "fly", "drive", "ride", "wear", "carry", "hold", "pick",

        // Social & emotion
        "thank", "please", "sorry", "welcome", "hello", "goodbye", "yes", "no", "ok", "okay",
        "sure", "fine", "great", "excellent", "wonderful", "terrible", "awful", "amazing", "interesting", "boring",

        // Measurement & quantity
        "large", "huge", "tiny", "giant", "much", "many", "few", "little", "more", "less",
        "most", "least", "several", "enough", "plenty", "half", "quarter", "double", "triple", "single",
        "whole", "entire", "complete", "total", "full", "partial", "some", "all", "none", "every",
        "each", "both", "either", "neither", "another", "extra", "plus", "minus", "times", "equal",

        // Business & money
        "business", "company", "service", "product", "market", "price", "cost", "value", "worth", "pay",
        "sell", "buy", "trade", "deal", "offer", "customer", "client", "store", "shop", "sale",

        // Education & learning
        "study", "subject", "lesson", "course", "test", "exam", "grade", "score", "knowledge", "skill",
        "practice", "exercise", "homework", "project", "paper", "report", "research", "science", "math", "history",

        // Government & society
        "government", "law", "court", "judge", "jury", "trial", "crime", "police", "army", "war",
        "peace", "vote", "election", "tax", "citizen", "community", "society", "public", "private", "local",

        // Health & medical
        "health", "sick", "ill", "disease", "pain", "hurt", "medicine", "drug", "cure", "treatment",
        "care", "hospital", "doctor", "patient", "injury", "accident", "emergency", "death", "birth", "alive",

        // Materials & substances
        "metal", "iron", "steel", "copper", "plastic", "glass", "cloth", "fabric", "leather", "rubber",
        "oil", "gas", "coal", "fuel", "chemical", "acid", "powder", "liquid", "solid", "material"
    ];

    // Check if a word is in the common words list
    function isCommonWord(word) {
        return commonWords.includes(word.toLowerCase());
    }

    // Get color for a word (matching color for color words, random otherwise)
    function getColorForWord(word) {
        var lowerWord = word.toLowerCase();

        // If it's a color word, return the matching color
        if (colorMap[lowerWord]) {
            var color = colorMap[lowerWord];
            // For very light colors on white background, darken them
            if (lowerWord === "white" || lowerWord === "yellow" || lowerWord === "beige" || lowerWord === "lavender") {
                return "#333333"; // Use dark gray for readability
            }
            return color;
        }

        // Otherwise return a random color
        var colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
            '#E63946', '#457B9D', '#F77F00', '#06FFA5', '#9B5DE5',
            '#F15BB5', '#00BBF9', '#00F5FF', '#FEE440', '#FB5607'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Generate random font family
    function getRandomFont() {
        var fonts = [
            "'Indie Flower', cursive",
            "'Cardo', Georgia, serif",
            "'Birthstone', cursive",
            "'Atkinson Hyperlegible Mono', monospace",
            "Georgia, serif",
            "'Comic Sans MS', cursive",
            "Impact, fantasy",
            "'Trebuchet MS', sans-serif"
        ];
        return fonts[Math.floor(Math.random() * fonts.length)];
    }

    // Load the image manifest once on startup
    async function loadImageManifest(showStatus) {
        if (showStatus && manifestStatusEl) {
            manifestStatusEl.textContent = 'Loading...';
            manifestStatusEl.style.color = '#666';
        }

        try {
            const response = await fetch('words/manifest.json?' + Date.now()); // Cache bust
            if (response.ok) {
                imageManifest = await response.json();
                var wordCount = Object.keys(imageManifest).length;
                console.log('Loaded image manifest with', wordCount, 'words');

                if (showStatus && manifestStatusEl) {
                    manifestStatusEl.textContent = 'Loaded ' + wordCount + ' words successfully';
                    manifestStatusEl.style.color = '#28a745';

                    // Re-render current word cards with new manifest
                    renderWordCards();

                    // Clear status after 3 seconds
                    setTimeout(function() {
                        manifestStatusEl.textContent = '';
                    }, 3000);
                }
            } else {
                console.error('Failed to load image manifest');
                imageManifest = {}; // Empty manifest as fallback

                if (showStatus && manifestStatusEl) {
                    manifestStatusEl.textContent = 'Failed to load manifest';
                    manifestStatusEl.style.color = '#dc3545';
                }
            }
        } catch (e) {
            console.error('Error loading image manifest:', e);
            imageManifest = {}; // Empty manifest as fallback

            if (showStatus && manifestStatusEl) {
                manifestStatusEl.textContent = 'Error loading manifest';
                manifestStatusEl.style.color = '#dc3545';
            }
        }
    }

    // Find all available images for a word (instant lookup, no network requests)
    function findImagesForWord(word) {
        var lowerWord = word.toLowerCase();

        // Wait for manifest to load
        if (imageManifest === null) {
            return [];
        }

        // Simple lookup in manifest
        return imageManifest[lowerWord] || [];
    }

    // Extract words from the current text
    function extractWords(text) {
        // Split by spaces and filter out empty strings
        return text.toUpperCase().split(/\s+/).filter(function(word) {
            return word.length > 0;
        });
    }

    // Clear all word cards
    function clearWordCards() {
        // Remove all cards except the template
        var cards = wordCardsContainer.querySelectorAll('.word-card');
        cards.forEach(function(card) {
            wordCardsContainer.removeChild(card);
        });
        currentWordCards = [];
    }

    // Render word cards based on current text
    function renderWordCards() {
        var text = decodeURIComponent(location.hash.split('#')[1] || '');
        var words = extractWords(text);

        // Clear existing cards
        clearWordCards();

        // Process each word
        for (var word of words) {
            var images = findImagesForWord(word);

            if (images.length > 0) {
                // Pick a random image from available options
                var randomImage = images[Math.floor(Math.random() * images.length)];

                // Create card from template
                var cardElement = wordCardTemplate.content.cloneNode(true);
                var cardDiv = cardElement.querySelector('.word-card');
                var imgElement = cardElement.querySelector('.word-image');

                imgElement.src = randomImage;
                imgElement.alt = word;

                // Add error handling for failed image loads
                imgElement.addEventListener('error', function() {
                    this.parentElement.style.display = 'none';
                });

                wordCardsContainer.appendChild(cardElement);
                currentWordCards.push(word);
            } else if (isCommonWord(word)) {
                // Create text-based card for common words without images
                var cardElement = wordCardTemplate.content.cloneNode(true);
                var cardDiv = cardElement.querySelector('.word-card');
                var imgElement = cardElement.querySelector('.word-image');

                // Remove the image element and replace with text
                imgElement.remove();

                // Create text display element
                var textElement = document.createElement('div');
                textElement.className = 'word-text';
                textElement.textContent = word;
                textElement.style.fontFamily = getRandomFont();
                textElement.style.color = getColorForWord(word);

                cardDiv.appendChild(textElement);
                wordCardsContainer.appendChild(cardElement);
                currentWordCards.push(word);
            }
        }
    }

    function enterInputMode(evt) {
        var defaultHash = '#' + encodeURIComponent(WELCOME_MSG);
        if (location.hash === defaultHash) {
            updateFragment('');
            renderText();
        }
        inputField.focus();
    }

    // Settings Modal Management
    var settingsModal = document.querySelector('#settings-modal');
    var fontSelect = document.querySelector('#font-select');
    var closeSettingsBtn = document.querySelector('#close-settings');
    var reloadManifestBtn = document.querySelector('#reload-manifest');
    var manifestStatusEl = document.querySelector('#manifest-status');

    var fontFamilies = {
        'atkinson': "'Atkinson Hyperlegible Mono', 'Courier New', Courier, monospace",
        'indie': "'Indie Flower', cursive",
        'cardo': "'Cardo', Georgia, 'Times New Roman', serif",
        'birthstone': "'Birthstone', cursive"
    };

    function getFontPreference() {
        return localStorage.getItem('display-font') || 'atkinson';
    }

    function setFontPreference(fontKey) {
        localStorage.setItem('display-font', fontKey);
        applyFont(fontKey);
    }

    function applyFont(fontKey) {
        var fontFamily = fontFamilies[fontKey] || fontFamilies['atkinson'];
        document.documentElement.style.setProperty('--display-font', fontFamily);
        fontSelect.value = fontKey;
    }

    // Letter case preference management
    var caseSelect = document.querySelector('#case-select');

    function getCasePreference() {
        return localStorage.getItem('letter-case') || 'both';
    }

    function setCasePreference(caseKey) {
        localStorage.setItem('letter-case', caseKey);
        applyCasePreference(caseKey);
    }

    function applyCasePreference(caseKey) {
        caseSelect.value = caseKey;
        renderTextImmediate(); // Re-render text with new case
    }

    function applyLetterCase(character) {
        var casePreference = getCasePreference();

        // Only transform letters, not emoji, numbers, or symbols
        if (!character.match(/\p{L}/iu)) {
            return character;
        }

        if (casePreference === 'uppercase') {
            return character.toUpperCase();
        } else if (casePreference === 'lowercase') {
            return character.toLowerCase();
        } else {
            // 'both' - return as typed
            return character;
        }
    }

    function toggleSettingsModal() {
        settingsModal.classList.toggle('open');
        if (settingsModal.classList.contains('open')) {
            mainDiv.classList.add('blurred');
        } else {
            mainDiv.classList.remove('blurred');
        }
    }

    function closeSettingsModal() {
        settingsModal.classList.remove('open');
        mainDiv.classList.remove('blurred');
    }

    // Settings event listeners
    closeSettingsBtn.addEventListener('click', closeSettingsModal, false);

    fontSelect.addEventListener('change', function(evt) {
        setFontPreference(evt.target.value);
    }, false);

    caseSelect.addEventListener('change', function(evt) {
        setCasePreference(evt.target.value);
    }, false);

    reloadManifestBtn.addEventListener('click', function() {
        loadImageManifest(true); // true = show status messages
    }, false);

    // Apply saved preferences on load
    applyFont(getFontPreference());
    applyCasePreference(getCasePreference());

    // Prevent focus loss and problematic keys
    inputField.addEventListener('blur', function() {
        // Immediately refocus if focus is lost
        inputField.focus();
    }, false);

    window.addEventListener('keydown', function(evt) {
        // Toggle settings menu with Ctrl+Shift+E
        if (evt.ctrlKey && evt.shiftKey && evt.key === 'E') {
            evt.preventDefault();
            toggleSettingsModal();
            return;
        }

        // Prevent Tab from moving focus
        if (evt.key === 'Tab') {
            evt.preventDefault();
            return;
        }

        // Prevent Escape key
        if (evt.key === 'Escape') {
            evt.preventDefault();
            return;
        }

        // Prevent F1-F12 keys from triggering browser actions
        if (evt.key.match(/^F([1-9]|1[0-2])$/)) {
            evt.preventDefault();
            return;
        }
    }, false);

    inputField.addEventListener('input', onInput, false);
    textDiv.addEventListener('click', enterInputMode, false);
    window.addEventListener('keypress', enterInputMode, false);
    window.addEventListener('hashchange', renderText, false);

    if (!location.hash) {
        updateFragment(WELCOME_MSG);
    }

    // Load image manifest on startup
    loadImageManifest();

    // Use requestAnimationFrame to ensure layout has settled before initial render
    requestAnimationFrame(function() {
        renderText();
    });
});
