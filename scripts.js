// FIXME: <template> won't work on IE

/*
    TODO:
    - double click on the word should select all characters
*/

// Security:
// URL fragment won't be sent as part of the request. Thus a-okay to share
// https://stackoverflow.com/questions/317760/how-to-get-url-hash-from-server-side

(function(){
    var word = document.querySelector('.word')
    var input = document.querySelector('.inputbox')
    var tmpl = document.querySelector('#charbox-template');

    if (!location.hash) {
        location.hash = '*hello*';
    }

    function clearChars() {
        while (word.firstChild) {
            word.removeChild(word.firstChild);
        }
    }

    function onHashChange() {
        clearChars();
        var text = decodeURIComponent(location.href.split('#')[1] || '');
        var fontSize = Math.min(150 / text.length, 30);
        text.split('').forEach(function(chr) {
            var charbox = tmpl.content.cloneNode(true);
            var charElem = charbox.querySelector('.char');
            if (chr !== ' ') {
                charElem.textContent = chr;
            } else {
                charElem.innerHTML = '&nbsp;';
            }
            if (!chr.match(/[a-z]/i)) {
                charElem.className = 'symbol';
            }
            charElem.style.fontSize = fontSize + 'vw';
            word.appendChild(charbox);
        });
        input.value = text;
    }

    function onInput(evt) {
        location.hash = encodeURIComponent(evt.target.value);
    }

    input.addEventListener('input', onInput, false);
    window.addEventListener('hashchange', onHashChange, false);

    onHashChange();
})();
