

var form  = document.querySelector('form');

var setDefaults = function () {
    var todaysDate = new Date();
    var twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(todaysDate.getDate() + 14);
    var defaults = {
        starts: todaysDate.toISOString().substr(0, 10),
        ends: twoWeeksFromNow.toISOString().substr(0, 10),
        points: 50,
        buffer: 0,
    };
    Object.keys(defaults).forEach((name) => {
        form.querySelector('input[name=' + name + ']').value = defaults[name];
    });
}
setDefaults();


var validate = function () {
    var data = [
        'starts',
        'ends',
        'points',
        'buffer',
    ].reduce((data, name) => {
        data[name] = form.querySelector('input[name=' + name + ']').value;
        return data;
    }, {});
    var onErr = (name) => {
        setDefaults();
        return null;
    }
    //TODO: validate end date is later than start date by at least one day
    //TODO: Actual feedback on error, rather than just resetting the form.
    if (!data.starts.match(/^\d{4}-\d{2}-\d{2}$/)) return onErr();
    if (!data.ends.match(/^\d{4}-\d{2}-\d{2}$/)) return onErr();
    if (!data.points || data.points < 1) return onErr();
    if (data.buffer < 0) return onErr();
    data.points = +data.points;
    data.buffer = +data.buffer;
    return data;
};

var callback;

form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    var data = validate();
    !!data && !!callback && callback(data);
});


module.exports = { onData: function (cbk) { callback = cbk; } };
