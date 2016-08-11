const fs = require('fs');
const stream = require('stream');
const ejs = require('ejs');
const browserify = require('browserify');

const promisify = function (fn) {
    return function () {
        var resolve, reject, promise = new Promise( (y, n) => {
            resolve = y;
            reject = n;
        });
        fn.apply(null, Array.prototype.slice.call(arguments).concat((err, res) => {
            if (!!err) return reject(err);
            resolve(res);
        }));
        return promise;
    }
};
const readFile = promisify((file, callback) => {fs.readFile(file, 'utf8', callback); });
const writeFile = promisify(fs.writeFile);
const streamToString = function (readable) {
    var arr = [];
    var writable = new stream.Writable({
        write: (chunk, enc, next) => {
            arr.push(enc === 'buffer' ? chunk.toString('utf-8') : chunk);
            next();
        }
    });
    var promise = new Promise(function (resolve, reject) {
        writable.on('finish', () => { resolve(arr.join('')); });
        writable.on('error', (err) => { reject(err); });
        readable.on('error', (err) => { reject(err); });
    });
    readable.pipe(writable);
    return promise;
};

const bundle = function (entry) {
    return streamToString(
        browserify(entry)
        .transform('babelify', {presets: 'es2015'})
        .bundle()
    );
};


Promise.all([
    readFile('src/index.html'),
    bundle('src/main.js'),
]).then((p) => {
    var html = p[0],
        script = p[1];
    return ejs.render(html, {script: script});
}).then((htmlOut) => {
    return writeFile('burndown-generator.html', htmlOut);
}).then(() => {
    console.log('ALL DONE');
}, (err) => {
    console.log('ERROR:', err, err.stack);
})
