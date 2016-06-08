/* jshint -W098 */
(function () {

    var colorsjs = require('colors/safe'),
        Console2 = require('./console2');

    /**
     * logger
     *
     * @param  {Console2|undefined} console
     * @param  {Function|undefined} validate
     */
    var logger = function (console, validate) {

        if (!(console instanceof Console2)) {

            if (!(process.console instanceof Console2)) {
                throw new Error("No process.console");
            } else {
                console = process.console;
            }
        }

        if (console.info === undefined) {
            throw new Error("No 'info' logger attach to console");
        }

        return function (ctx, next) {

            if (!validate || validate(ctx)) {

                console
                    .time()
                    .tag(
                        {msg: 'Express', colors: 'cyan'},
                        {msg: ctx.ip, colors: 'red'},
                        {msg: ctx.method, colors: 'green'},
                        {
                            msg   : (/mobile/i.test(ctx.headers['user-agent']) ? 'MOBILE' : 'DESKTOP'),
                            colors: 'grey'
                        }
                    )
                    .info(req.url);
            }

            next();
        };

    };

    module.exports = {

        logger: logger

    };
}());
