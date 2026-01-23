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

    // List of most common English words (top 500)
    var commonWords = [
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
        "is", "was", "are", "been", "has", "had", "were", "said", "did", "having",
        "may", "should", "could", "being", "does", "did", "doing", "would", "should", "can",
        "man", "woman", "child", "boy", "girl", "family", "friend", "person", "life", "hand",
        "eye", "head", "face", "place", "door", "house", "room", "home", "world", "school",
        "water", "food", "tree", "air", "fire", "sea", "sun", "moon", "star", "light",
        "red", "blue", "green", "black", "white", "yellow", "big", "small", "long", "short",
        "hot", "cold", "old", "young", "new", "good", "bad", "happy", "sad", "right",
        "left", "high", "low", "near", "far", "fast", "slow", "early", "late", "open",
        "close", "walk", "run", "sit", "stand", "eat", "drink", "sleep", "wake", "read",
        "write", "speak", "listen", "see", "look", "hear", "smell", "touch", "feel", "think",
        "know", "understand", "remember", "forget", "learn", "teach", "ask", "answer", "help", "work",
        "play", "buy", "sell", "give", "take", "bring", "send", "love", "like", "want",
        "need", "try", "use", "find", "keep", "let", "begin", "start", "stop", "end",
        "turn", "call", "put", "hold", "stay", "leave", "wait", "follow", "fall", "sit",
        "cat", "dog", "bird", "fish", "horse", "cow", "pig", "sheep", "chicken", "rabbit",
        "bear", "lion", "tiger", "elephant", "monkey", "snake", "frog", "bee", "fly", "ant",
        "book", "pen", "paper", "desk", "chair", "table", "bed", "window", "wall", "floor",
        "car", "bus", "train", "plane", "ship", "boat", "bike", "road", "street", "bridge",
        "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "today", "yesterday", "tomorrow",
        "morning", "afternoon", "evening", "night", "day", "week", "month", "year", "spring", "summer",
        "fall", "autumn", "winter", "january", "february", "march", "april", "may", "june", "july",
        "august", "september", "october", "november", "december", "hour", "minute", "second", "time", "clock",
        "brother", "sister", "mother", "father", "son", "daughter", "husband", "wife", "uncle", "aunt",
        "grandma", "grandpa", "baby", "kid", "teen", "adult", "mr", "mrs", "miss", "doctor",
        "teacher", "student", "worker", "farmer", "cook", "driver", "nurse", "police", "soldier", "artist",
        "city", "town", "village", "country", "state", "nation", "street", "park", "garden", "farm",
        "store", "shop", "market", "bank", "hospital", "church", "school", "library", "museum", "theater",
        "restaurant", "hotel", "office", "factory", "station", "airport", "port", "beach", "mountain", "river",
        "lake", "forest", "field", "island", "valley", "hill", "ocean", "desert", "sky", "cloud",
        "rain", "snow", "wind", "storm", "ice", "weather", "season", "nature", "animal", "plant",
        "flower", "grass", "leaf", "fruit", "vegetable", "apple", "orange", "banana", "grape", "lemon",
        "milk", "bread", "meat", "rice", "egg", "cheese", "butter", "salt", "sugar", "tea",
        "coffee", "juice", "soup", "cake", "cookie", "candy", "chocolate", "breakfast", "lunch", "dinner",
        "plate", "cup", "bowl", "spoon", "fork", "knife", "bottle", "glass", "box", "bag",
        "shirt", "pants", "dress", "coat", "hat", "shoe", "sock", "glove", "belt", "watch",
        "ring", "key", "money", "dollar", "cent", "card", "gift", "toy", "game", "ball",
        "phone", "computer", "tv", "radio", "camera", "picture", "photo", "video", "music", "song",
        "movie", "story", "news", "letter", "word", "sentence", "question", "answer", "number", "name",
        "color", "shape", "size", "sound", "smell", "taste", "feeling", "idea", "thought", "dream",
        "hope", "wish", "plan", "problem", "solution", "reason", "way", "kind", "type", "part",
        "piece", "bit", "lot", "group", "team", "class", "club", "party", "meeting", "event"
    ];

    // Check if a word is in the common words list
    function isCommonWord(word) {
        return commonWords.includes(word.toLowerCase());
    }

    // Generate random color
    function getRandomColor() {
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
                textElement.style.color = getRandomColor();

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
