window.addEventListener('DOMContentLoaded', function() {
    "use strict";

    var WELCOME_MSG = '*hello*';

    var mainDiv = document.querySelector('.main');
    var textDiv = document.querySelector('.text');
    var inputField = document.querySelector('.inputbox');
    var shareLinkField = document.querySelector('.js-share-link');
    var charboxTemplate = document.querySelector('#charbox-template');
    var defaultTitle = document.querySelector("title").innerText;

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    var isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.getElementById('darktoggle').addEventListener('click', () => setDarkMode(!isDarkMode));
    setDarkMode(isDarkMode);

    function setDarkMode(darkMode) {
        isDarkMode = darkMode; 
        document.getElementById('darktoggle').innerText = isDarkMode ? '☀️' : '🌑';
        document.body.classList.toggle('dark-mode', isDarkMode);
    }

    function updateFragment(text) {
        // Don't spam the browser history & strip query strings.
        window.location.replace(location.origin + '/#' + encodeURIComponent(text));
        shareLinkField.value = location.origin + '/' + location.hash;
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

    function modalKeyHandler(sel, evt) {
        // ESC to close the modal
        if (evt.keyCode === 27) {
            hideModal(sel);
        }
    }

    function showModal(sel) {
        window.removeEventListener('keypress', enterInputMode);
        var modalDiv = document.querySelector(sel);
        modalDiv.classList.add('open');
        mainDiv.classList.add('blurred');
        var closeBtn = modalDiv.querySelector('.js-modal-close');

        // Use legacy event handling to avoid having to unregister handlers
        closeBtn.onclick = hideModal.bind(null, sel);
        window.onkeydown = modalKeyHandler.bind(null, sel);

        // Make sure we're scrolled to the top on mobile
        modalDiv.scrollTop = 0;

        ga('send', 'event', 'modal-show', sel);
    }

    function hideModal(sel) {
        var modalDiv = document.querySelector(sel);
        modalDiv.classList.remove('open');
        mainDiv.classList.remove('blurred');
        window.onkeydown = null;
        window.addEventListener('keypress', enterInputMode, false);
    }

    function initAnalytics() {
        // this check is needed to make sure the app still works on mobile without internet connection
        if (window.navigator.onLine) {
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('set', 'anonymizeIp', true);
            ga('create', 'UA-37242602-2', 'auto');
            ga('send', 'pageview');

            window.twttr = window.twttr || {
                _e: [],
                ready: function(f) {
                    this._e.push(f);
                }
            };

            twttr.ready(function (twttr) {
                twttr.events.bind('follow', function(event) {
                    ga('send', 'event', 'twitter', 'follow');
                });
                twttr.events.bind('tweet', function(event) {
                    ga('send', 'event', 'twitter', 'tweet');
                });
            });
        }
    }

    document.querySelector('.js-help-button').addEventListener('click', function(evt) {
        evt.preventDefault();
        showModal('.js-help-modal');
    }, false);

    document.querySelector('.js-share-button').addEventListener('click', function(evt) {
        evt.preventDefault();
        showModal('.js-share-modal');

        // Don't pop up the keyboard on mobile
        if (!isMobile) {
            shareLinkField.select();
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
    initAnalytics();
});
