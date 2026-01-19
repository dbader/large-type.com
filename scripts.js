window.addEventListener('DOMContentLoaded', function() {
    "use strict";

    var WELCOME_MSG = '*hello*';

    var mainDiv = document.querySelector('.main');
    var textDiv = document.querySelector('.text');
    var inputField = document.querySelector('.inputbox');
    var charboxTemplate = document.querySelector('#charbox-template');
    var defaultTitle = document.querySelector("title").innerText;

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
        // Return a space as typing indicator if text is empty.
        var text = decodeURIComponent(location.hash.split('#')[1] || ' ');

        clearChars();

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

        var fontSize = Math.min(150 / textWidth, 30);

        forEachSegment(function(seg) {
            var charbox = charboxTemplate.content.cloneNode(true);
            var charElem = charbox.querySelector('.char');
            charElem.style.fontSize = fontSize + 'vw';

            if (seg !== ' ') {
                charElem.textContent = seg;
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

        // Ignore the placeholder space (typing indicator).
        if (text === ' ') {
            text = '';
        }

        // Don't jump the cursor to the end
        if (inputField.value !== text) {
            inputField.value = text;
        }
        updateFragment(text);
        updateTitle(text);

        // Update word image cards
        renderWordCards();
    }

    function onInput(evt) {
        updateFragment(evt.target.value);
    }

    // Word Image Cards Feature
    var wordCardsContainer = document.querySelector('.word-cards-container');
    var wordCardTemplate = document.querySelector('#word-card-template');
    var imageCache = {}; // Cache for available images
    var currentWordCards = []; // Track currently displayed word cards

    // Check if an image file exists
    async function imageExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    // Find all available images for a word
    async function findImagesForWord(word) {
        var lowerWord = word.toLowerCase();

        // Check cache first
        if (imageCache[lowerWord]) {
            return imageCache[lowerWord];
        }

        var images = [];
        var extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

        // Check for word.ext (e.g., dog.png, dog.jpg)
        for (var ext of extensions) {
            var url = 'word-images/' + lowerWord + '.' + ext;
            if (await imageExists(url)) {
                images.push(url);
            }
        }

        // Check for word-N.ext (e.g., dog-1.png, dog-2.jpg)
        for (var i = 1; i <= 10; i++) { // Check up to 10 variations
            for (var ext of extensions) {
                var url = 'word-images/' + lowerWord + '-' + i + '.' + ext;
                if (await imageExists(url)) {
                    images.push(url);
                }
            }
        }

        // Cache the results
        imageCache[lowerWord] = images;
        return images;
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
    async function renderWordCards() {
        var text = decodeURIComponent(location.hash.split('#')[1] || '');
        var words = extractWords(text);

        // Clear existing cards
        clearWordCards();

        // Process each word
        for (var word of words) {
            var images = await findImagesForWord(word);

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

    var fontFamilies = {
        'comic': "'Comic Sans MS', 'Century Gothic', 'Trebuchet MS', Verdana, sans-serif",
        'verdana': "Verdana, Geneva, 'DejaVu Sans', sans-serif",
        'georgia': "Georgia, 'Times New Roman', serif",
        'arial': "Arial, Helvetica, sans-serif",
        'monospace': "'Courier New', Courier, monospace"
    };

    function getFontPreference() {
        return localStorage.getItem('display-font') || 'comic';
    }

    function setFontPreference(fontKey) {
        localStorage.setItem('display-font', fontKey);
        applyFont(fontKey);
    }

    function applyFont(fontKey) {
        var fontFamily = fontFamilies[fontKey] || fontFamilies['comic'];
        document.documentElement.style.setProperty('--display-font', fontFamily);
        fontSelect.value = fontKey;
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

    // Apply saved font preference on load
    applyFont(getFontPreference());

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

    renderText();
});
