const Graph = require('canvas-graph');
const Rect = require
const WorkDays = require('workdays');
const offDays = require('./offdays.json');

const getCanvas = function () {
    var canvas = document.querySelector('canvas');
    var sty = getComputedStyle(canvas);
    var o = {
        ctx: canvas.getContext('2d'),
        w: Math.floor(+sty.width.replace('px', '')),
        h: Math.floor(+sty.height.replace('px', '')),
    }
    canvas.width = o.w;
    canvas.height = o.h;
    return o;
};

const calcSteps = function (points, max) {
    var alt = [2, 5, 10, 20, 50, 100, 500, 1000, 2000, 5000, 10000];
    var i = 0;
    while (alt[i] && points/alt[i] > max) i++;
    return alt[i];
};

const getDateLabel = function (dayCalc) {
    const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return (n) => {
        var d = dayCalc.getDate(n);
        return DAYS[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
    }
};


const getGraph = function (data) {
    var o = {
        minx: 0,
        majorx: 1,
        minorx: 1,
        miny: 0,
        xTickFormat: data.dateLabel,
    }
    o.maxx = data.nDays + 0.5;
    o.minory = calcSteps(data.total, 40);
    o.majory = calcSteps(data.total/o.minory, 10) * o.minory;
    o.maxy = (Math.floor(data.total/o.majory) + 1) * o.majory;
    return new Graph(o);
};

const drawLine = function (carta, color, points, days) {
    carta.mapDrawing(function (ctx) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, points);
        ctx.lineTo(days, 0);
        ctx.stroke();
        ctx.restore();
    });
};


const render = function (data) {
    var dayCalc = new WorkDays(data.starts, offDays);
    data.total = data.points + data.buffer;
    data.nDays = dayCalc.getDays(data.ends);
    data.dateLabel = getDateLabel(dayCalc);
    var g = getGraph(data);
    var c = getCanvas();
    c.ctx.fillStyle = '#fff';
    c.ctx.strokeStyle = '#000';
    c.ctx.width = '1';
    var carta = g.draw(c.ctx, c.w, c.h);
    if (!!data.buffer) drawLine(carta, '#5f5', data.total, data.nDays);
    drawLine(carta, '#f55', data.points, data.nDays * data.points / data.total);
};

module.exports = render;
