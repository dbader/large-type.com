window.addEventListener('DOMContentLoaded', function() {
    "use strict";

    var WELCOME_MSG = '*hello*';

    var mainDiv = document.querySelector('.main');
    var textDiv = document.querySelector('.text');
    var inputField = document.querySelector('.inputbox');
    var shareLinkField = document.querySelector('.js-share-link');
    var charboxTemplate = document.querySelector('#charbox-template');

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    function updateFragment(text) {
        // Don't spam the browser history & strip query strings.
        window.location.replace(location.origin + '/#' + encodeURIComponent(text));
        shareLinkField.value = location.origin + '/' + location.hash;
    }

    function clearChars() {
        while (textDiv.firstChild) {
            textDiv.removeChild(textDiv.firstChild);
        }
    }

    function renderText() {
        // Return a space as typing indicator if text is empty.
        var text = decodeURIComponent(location.hash.split('#')[1] || ' ');
        var fontSize = Math.min(150 / text.length, 30);

        clearChars();

        text.split('').forEach(function(chr) {
            var charbox = charboxTemplate.content.cloneNode(true);
            var charElem = charbox.querySelector('.char');
            charElem.style.fontSize = fontSize + 'vw';

            if (chr !== ' ') {
                charElem.textContent = chr;
            } else {
                charElem.innerHTML = '&nbsp;';
            }

            if (chr.match(/[0-9]/i)) {
                charElem.className = 'number';
            } else if (!chr.match(/[a-z]/i)) {
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
