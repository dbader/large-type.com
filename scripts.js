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

        // Don't jump the cursor to the end
        if (inputField.value !== text) {
            inputField.value = text;
        }
        updateFragment(text);
        updateTitle(text);
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
