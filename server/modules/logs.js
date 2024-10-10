const chalk = require('chalk');
const cstamp = require('console-stamp');

// map between log types -> chalk functions
const colors = {
    log: chalk.blue,
    dir: chalk.blue,
    info: chalk.green,
    warn: chalk.yellow,
    assert: chalk.magenta,
    error: chalk.red,
};

// Apply chalk to parsed text. This assumes that inp contains the console type (ex: inp = [Error] => console.error)
function labelColorizer(options) {
    return (inp) => {
        const label = inp.slice(options.labelPrefix.length, -options.labelSuffix.length).toLowerCase();
        return typeof options.colorFuncs[label] === 'function' ? options.colorFuncs[label](inp) : inp;
    };
}

// Init console.stamp
function init() {
    // Override native console
    cstamp(console, {
        // pattern: 'dd/mm/yyyy HH:MM:ss',
        colors: {
            label: labelColorizer({
                labelPrefix: "[",
                labelSuffix: "]",
                colorFuncs: colors
            })
        },
    });
}

module.exports = {
    init: init
}