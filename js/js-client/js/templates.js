

var csvTemplate = loadTemplate('templates/csv.html');
var dbTemplate = loadTemplate('templates/db.html');
var randomTemplate = loadTemplate('templates/random.html');
var singleTemplate = loadTemplate('templates/singleEvent.html');

function loadTemplate(url) {
    return $.ajax({type: "GET", url: url, async: false}).responseText;
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};