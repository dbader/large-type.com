// FIXME: <template> won't work on IE

/*
    TODO:
    - double click on the word should select all characters
*/

// Security:
// URL fragment won't be sent as part of the request. Thus a-okay to share
// https://stackoverflow.com/questions/317760/how-to-get-url-hash-from-server-side

(function(){
    var WELCOME_MSG = '*hello*';

    var word = document.querySelector('.word')
    var input = document.querySelector('.inputbox')
    var tmpl = document.querySelector('#charbox-template');

    if (!location.hash) {
        location.hash = encodeURIComponent(WELCOME_MSG);
    }

    function clearChars() {
        while (word.firstChild) {
            word.removeChild(word.firstChild);
        }
    }

    function onHashChange() {
        clearChars();

        // Return a space as typing indicator if text is empty.
        var text = decodeURIComponent(location.hash.split('#')[1] || ' ');

        var fontSize = Math.min(150 / text.length, 30);

        text.split('').forEach(function(chr) {
            var charbox = tmpl.content.cloneNode(true);
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

            word.appendChild(charbox);
        });

        // Ignore the placeholder space (typing indicator).
        if (text === ' ') {
            text = '';
        }
        input.value = text;
        location.hash = encodeURIComponent(text);
    }

    function onInput(evt) {
        location.hash = encodeURIComponent(evt.target.value);
    }

    function enterInputMode(evt) {
        var defaultHash = '#' + encodeURIComponent(WELCOME_MSG);
        if (location.hash === defaultHash) {
            location.hash = '';
            onHashChange();
        }
        input.focus();
    }

    input.addEventListener('input', onInput, false);
    word.addEventListener('click', enterInputMode, false);
    window.addEventListener('keydown', enterInputMode, false);
    window.addEventListener('hashchange', onHashChange, false);

    onHashChange();

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('set', 'anonymizeIp', true);
    ga('create', 'UA-37242602-2', 'auto');
    ga('send', 'pageview');
})();
