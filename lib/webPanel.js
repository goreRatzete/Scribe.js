/* jshint -W098 */
(function () {

    'use strict';

    var Router = require('koa-router'),
        serve = require('koa-router-static'),
        convert = require('koa-convert'),
        path = require('path'),
        fs = require('fs');

    /**
     * map
     *
     * Custom map function
     * That filter undefined and null values
     *
     * @param  {Array}    arr
     * @param  {Function} callback
     * @return {Array}
     */
    var map = function (arr, callback) {

        var result = arr.map(callback);

        return result.filter(function (item) {
            return item !== undefined && item !== null;
        });
    };

    module.exports = function (consoles) {

        var router = Router();

        //Static files

        router.use('/*', (serve(path.join(__dirname, '..', 'static'))));

        //API

        /**
         * readDir
         *
         * Return dir content
         *
         * @param {String}      dirPath     A path
         * @param {Function}    callback    Function to chain with result array
         */
        var readDir = function (dirPath, callback) {

            if (!dirPath || typeof dirPath !== 'string') {
                callback("dirPath must be a string");
            } else {
                fs.readdir(dirPath, function (err, list) {
                    var dir = [];

                    if (err) {
                        callback(err, null);
                    } else {
                        list.forEach(function (item) {
                            dir.push(readNode(path.join(dirPath, item)));
                        });

                        callback(null, dir);
                    }

                });
            }

        };

        /**
         * readNode
         *
         * Return some infos on the file or folder given
         *
         * @param  {String} itemPath    A path
         * @return {Object}
         * @return {String} type        'folder' or 'file'
         * @return {String} name
         * @return {String} path        @see params
         */
        var readNode = function (itemPath) {

            var info = fs.statSync(itemPath),
                item = {};

            item.type = info.isDirectory() ? 'folder' : 'file';
            item.name = path.basename(itemPath);
            item.path = itemPath;

            return item;
        };

        /**
         * getLogFolders
         *
         * @return {Array}  logs folder in use
         */
        var getLogFolders = function () {

            return map(consoles, function (elem) {
                return elem.logWriter ? elem.logWriter.rootPath : undefined;
            });
        };

        /**
         * getLogWriter
         *
         * @param {String}  logFolder   root folder of the logWriter to find
         *
         * @return {LogWriter|false}    If false, no logWriter with rootPath set to logFolder
         */
        var getLogWriter = function (logFolder) {

            var logWriter;

            return consoles.some(function (item) {
                if (item.logWriter && item.logWriter.rootPath === logFolder) {
                    logWriter = item.logWriter;
                    return true;
                }
            }) ? logWriter : false;

        };

        /**

         * This function scans through any webPanel request.
         * if the request contains the 'path' query parameter then it will pass it
         * through a check that ensures the following:
         - it contains logs
         - it contains 20xx
         - it is accessing a .json file
         * if it passess the checks it sends the request to the next webPanel function
         * otherwise it returns a json error message



         */

        router.use(function (ctx, next) {

            var path = ctx.query.path;

            if (path != null) {
                if (path.indexOf("logs") != -1 && path.indexOf("20") != -1 && path.indexOf(".json") != -1) {
                    next();
                } else {
                    var response = {};
                    response.error = true;
                    ctx.json(response);
                }
            } else {
                next();
            }


        });


        /**
         * /api
         *
         * Send logWriters
         */
        router.get('/api', function (ctx) {

            var path = ctx.query.path;

            ctx.status(200).json(getLogFolders());
        });

        /**
         * /api/folderExplorer
         *
         * Send path content info
         */
        router.get('/api/folderExplorer', function (ctx) {

            var path = ctx.query.path;

            readDir(path, function (err, dir) {
                if (err) {
                    ctx.status(400).end();
                } else {
                    ctx.status(200).json(dir);
                }
            });
        });

        /**
         * /api/dateExplorer
         *
         * Send files according to history dates
         * With pagination
         */
        router.get('/api/dateExplorer', function (ctx) {

            var from = ctx.query.from || Date.now(),
                length = ctx.query.length || 10,
                logFolder = ctx.query.logFolder;

            var logWriter = getLogWriter(logFolder);

            if (!logWriter) {
                ctx.status(400).send('No logWriter attached to ' + logFolder);
            } else {

                var logWriterDates = Object.keys(logWriter.history.dates).sort();

                //Find the good dates
                var nb = 0,
                    result = [],
                    dates = logWriterDates.reverse().filter(function (date) {
                        if (date < from && nb <= length) {
                            nb++;
                            return date;
                        } else {
                            return null;
                        }
                    });

                dates.forEach(function (date) {
                    result.push({
                        date : date,
                        files: map(logWriter.history.dates[date], function (item) {
                            return {
                                name: path.basename(item),
                                path: item
                            };
                        })
                    });
                });

                ctx.status(200).json(result);
            }
        });

        /**
         * /api/log
         *
         * Send stream of file content
         */
        router.get('/api/log', function (ctx) {

            var path = ctx.query.path;

            if (fs.existsSync(path)) {
                var stream = fs.createReadStream(path);

                ctx.length = fs.statSync(path).size;
                ctx.type = 'text/plain';

                ctx.body = stream;
            } else {
                ctx.throw(400, "Can't read path");
            }
        });


        /**
         * /api/timezone
         *
         * Send the server timezone offset
         */
        router.get('/api/timezoneOffset', function (ctx) {

            ctx.status(200).json({
                timezoneOffset: (new Date()).getTimezoneOffset()
            });

        });

        return router;
    };
}());
