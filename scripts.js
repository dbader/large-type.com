// FIXME: <template> won't work on IE

// Security:
// URL fragment won't be sent as part of the request. Thus a-okay to share
// https://stackoverflow.com/questions/317760/how-to-get-url-hash-from-server-side

var word = document.querySelector('.word')
var tmpl = document.querySelector('#charbox-template');

function clearWord() {
    while (word.firstChild) {
        word.removeChild(word.firstChild);
    }
}

function onHashChange() {
    clearWord();
    var text = location.hash.slice(1, location.hash.length);
    text.split('').forEach(function(chr) {
        var charbox = tmpl.content.cloneNode(true);
        charbox.querySelector('.char').innerText = chr;
        word.appendChild(charbox);
    });
}

window.addEventListener('hashchange', onHashChange, false);

onHashChange();
