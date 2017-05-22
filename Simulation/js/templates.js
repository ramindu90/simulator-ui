

var singleTemplate = loadTemplate('simulatorTemplates/singleEvent.html');

function loadTemplate(url) {
    return $.ajax({type: "GET", url: url, async: false}).responseText;
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};