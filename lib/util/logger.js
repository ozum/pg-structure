/*jslint node: true */
"use strict";

module.exports  = {};
var winston     = require('winston');
var api         = module.exports;
var levels      = ['debug', 'info', 'warn', 'error'];
var logger      = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: 'info' }),
        new (winston.transports.File)({ level: 'error', filename: 'pg-structure-error.log', timestamp: true })
    ]
});

levels.forEach(function(level){
    api[level] = logger[level].bind(logger);
});
