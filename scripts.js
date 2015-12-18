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
    var tmpl = document.querySelector('#charbox-template');

    if (!location.hash) {
        location.hash = '*hello*';
    }

    function clearWord() {
        while (word.firstChild) {
            word.removeChild(word.firstChild);
        }
    }

    function onHashChange() {
        clearWord();
        var text = decodeURIComponent(location.href.split('#')[1] || '');
        text.split('').forEach(function(chr) {
            var charbox = tmpl.content.cloneNode(true);
            charbox.querySelector('.char').textContent = chr;
            word.appendChild(charbox);
        });
    }

    window.addEventListener('hashchange', onHashChange, false);

    onHashChange();
})();
