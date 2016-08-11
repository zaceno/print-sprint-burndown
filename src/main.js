var form = require('./form');
var render = require('./render');
form.onData(function (data) {
    render(data);
    window.print();
});
